import EventEmitter from 'events';

import { Array as ArrayUtils, buffer } from '@nti/lib-commons';
import Logger from '@nti/util-logger';

import PresenceInfo from '../models/entities/PresenceInfo.js';

import UserPresence from './UserPresence.js';

/** @typedef {import('../interface/DataServerInterface.js').default} DataServerInterface */
/** @typedef {import('./Service.js').default} ServiceDocument */
/** @typedef {import('./WebSocketClient.js').default} WebSocketClient */
/** @typedef {import('../models/preferences/ChatPresenceState.js').default} ChatPresenceState */
/** @typedef {import('../models/chat/RoomInfo.js').default} RoomInfo */

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
	/** @type {UserPresence} */
	#preferences = null;

	availableForChat = true;

	/**
	 * @param {ServiceDocument} service
	 */
	constructor(service) {
		super();

		const server = service.getServer();
		this.#preferences = service.getUserPreferences();
		this.#service = service;
		this.#server = server;
		const socket = (this.#socket = server.getWebSocketClient());
		this.parse = async x => service.getObject(x);

		this.#preferences.on('change', this.onUserPreferenceChange);

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

	onUserPreferenceChange = (root, section, scope) => {
		const key = [section, scope].join('.');
		if (key === 'ChatPresence.Active') {
			buffer.inline(this.onUserPreferenceChange, 100, () => {
				const presence = this.#preferences.get(key);
				this.setPresenceFromPreference(presence);
			});
		}
	};

	onNewSocketConnection = async () => {
		logger.trace('created a new connection');

		const presence = await this.#preferences.fetch('ChatPresence.Active');

		this.setPresenceFromPreference(presence);
	};

	/**
	 * @private
	 * @param {ChatPresenceState} presencePreference
	 */
	setPresenceFromPreference(presencePreference) {
		const presenceInfo = PresenceInfo.from(
			this.#service,
			presencePreference?.type ?? 'available',
			presencePreference?.show,
			presencePreference?.status
		);

		UserPresence.setPresence(presenceInfo.username, presenceInfo);

		this.changePresence(presenceInfo);
	}

	changePresence(
		presenceInfo = PresenceInfo.from(this.#service, 'unavailable'),
		callback = noop
	) {
		const socket = this.#socket;
		socket.send(
			'chat_setPresence',
			presenceInfo.toJSON(),
			callback || noop
		);
	}

	getPresence(username) {
		username = toUsername(username);

		if (!username) {
			return;
		}

		return UserPresence.getPresence(username);
	}

	setPresence(username, presence) {
		UserPresence.setPresence(username, presence);
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

	/**
	 * Used when sending a status message through the STATE channel:
	 * - The server expects the body argument to be a dictionary (i.e. an object.)
	 * - The server expects the recipients argument to be defined and it's okay for it to be an empty
	 * array.
	 *
	 * @param {object} room
	 * @param {object} state
	 * @param {Function} acknowledgment
	 */
	async postStatus(room, state, acknowledgment) {
		const data = {
			Class: 'MessageInfo',
			ContainerId: room.getID(),
			channel: 'STATE',
			body: state,
		};

		this.#socket.send('chat_postMessage', data, async result =>
			acknowledgment?.(result, data)
		);
	}

	/** @typedef {(result: unknown, data: unknown) => void} AcknowledgmentFunction */
	/**
	 *
	 * @param {RoomInfo} room
	 * @param {object|any[]} message
	 * @param {string[]} replyTo
	 * @param {string} channel
	 * @param {string[]=} recipients
	 * @param {AcknowledgmentFunction=} acknowledgment
	 */
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
		logger.trace('Updated presence info', message);
		for (const [username, rawPresence] of Object.entries(message)) {
			const presence = await this.parse({
				...rawPresence,
				source: 'socket',
			});

			this.setPresence(username, presence);
		}
	}

	async onExitedRoom(roomInfo) {
		logger.trace('Chat room exited', roomInfo);
		roomInfo = await this.parse(roomInfo);
		this.emit('exited-room', roomInfo);
	}

	async onEnteredRoom(roomInfo) {
		logger.trace('Chat room entered', roomInfo);
		roomInfo = await this.parse(roomInfo);
		this.emit('entered-room', roomInfo);
	}

	async onRoomMembershipChanged(roomInfo) {
		logger.trace('Chat room membership changed', roomInfo);
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
