import EventEmitter from 'events';

import { Array as ArrayUtils } from '@nti/lib-commons';
import Logger from '@nti/util-logger';

import PresenceInfo from '../models/entities/PresenceInfo.js';

import UserPresence from './UserPresence.js';

/** @typedef {import('../interface/DataServerInterface.js').default} DataServerInterface */
/** @typedef {import('./Service.js').default} ServiceDocument */
/** @typedef {import('./WebSocketClient.js').default} WebSocketClient */

const logger = Logger.get('chat-client');
const noop = () => {};
const toUsername = x => x?.Username || x?.get?.('Username') || x;

export class ChatClient extends EventEmitter {
	/** @type {ServiceDocument} */
	#service = null;
	/** @type {DataServerInterface} */
	#server = null;
	/** @type {WebSocketClient} */
	#socket = null;

	availableForChat = true;

	/**
	 * @param {ServiceDocument} service
	 */
	constructor(service) {
		super();

		const server = service.getServer();
		this.#service = service;
		this.#server = server;
		const socket = (this.#socket = server.getWebSocketClient());
		this.parse = async x => service.getObject(x);

		socket.register(
			wrap({
				scope: this,
				chat_setPresenceOfUsersTo: 'onPresenceChange',
				disconnect: ['onSocketDisconnect'],
				serverkill: ['onSocketDisconnect'],
				chat_exitedRoom: ['onExitedRoom'],
				chat_roomMembershipChanged: ['onRoomMembershipChanged'],
				chat_recvMessage: ['onMessage'],
				chat_recvMessageForShadow: ['onMessage'],
				chat_enteredRoom: 'onEnteredRoom',
			})
		);

		socket.on('socket-new-session-id', this.onNewSocketConnection);
		socket.onSocketAvailable(() => {
			logger.trace('Chat onSessionReady');
			this.onNewSocketConnection();
		});
	}

	onNewSocketConnection = async () => {
		logger.trace('created a new connection');
		const preferences = this.#service.getUserPreferences();

		const presence = await preferences.fetch('ChatPresence.Active');

		this.changePresence(
			presence?.type ?? 'available',
			presence?.show,
			presence?.status
		);
	};

	changePresence(type, show = null, status = null, callback = noop) {
		const socket = this.#socket;
		const newPresence = PresenceInfo.from(
			this.#service,
			type,
			show,
			status
		);

		socket.send('chat_setPresence', newPresence.toJSON(), callback || noop);
	}

	getPresence(username) {
		username = toUsername(username);

		if (!username) {
			return;
		}

		return UserPresence.getPresence(username);
	}

	setPresence(username, presence) {
		UserPresence.getPresence(username, presence);
	}

	async enterRoom(occupants, options, callback) {
		this.#socket.send(
			'chat_enterRoom',
			{ Occupants: occupants, ...options },
			callback
		);
	}

	async exitRoom(room) {
		const socket = this.#socket;
		if (!room) {
			return;
		}

		if (room.isModerator) {
			logger.debug(
				"leaving room but I'm a moderator, relinquish control"
			);

			return new Promise(complete => {
				socket.send('chat_makeModerated', room.getID(), false, () => {
					logger.debug('un-moderated, now exiting room');
					socket.send('chat_exitRoom', room.getID(), complete);
				});
			});
		}
		return new Promise(fin =>
			socket.send('chat_exitRoom', room.getID(), fin)
		);
	}

	async postMessage(
		room,
		message,
		replyTo,
		channel,
		recipients,
		acknowledgment
	) {
		const data = {
			Class: 'MessageInfo',
			ContainerId: room.getID(),
			body: ArrayUtils.ensure(message),
			channel,
			recipients,
		};

		this.#socket.send('chat_postMessage', data, async result =>
			acknowledgment?.(result, data)
		);
	}

	//#region Event Handlers

	onSocketDisconnect() {
		this.emit('disconnect');
	}

	/**
	 * This should only be called by the socket event emitter.
	 *
	 * @private
	 * @param {Object.<string,Object>} message
	 */
	async onPresenceChange(message) {
		for (const [username, rawPresence] of Object.entries(message)) {
			const presence = this.parse({ ...rawPresence, source: 'socket' });

			this.setPresence(username, presence);
		}
	}

	async onExitedRoom(roomInfo) {
		roomInfo = await this.parse(roomInfo);
		this.emit('exited-room', roomInfo);
	}

	async onEnteredRoom(roomInfo) {
		roomInfo = await this.parse(roomInfo);
		this.emit('entered-room', roomInfo);
	}

	async onRoomMembershipChanged(roomInfo) {
		roomInfo = await this.parse(roomInfo);
		this.emit('room-membership-changed', roomInfo);
	}

	async onMessage(message, options) {
		message = await this.parse(message);
		this.emit('message', message, options);
	}

	//#endregion
}

function wrap({ scope, ...handlers }) {
	const out = { scope };

	for (const [event, handler] of Object.entries(handlers)) {
		out[event] = handler;

		if (Array.isArray(handler)) {
			const [method] = handler;

			out[event] = (...args) => {
				if (!scope.availableForChat) {
					return logger.trace('Dropped %s handling', event);
				}

				return scope[method](...args);
			};
		}
	}
	return out;
}
