/* eslint-disable no-restricted-globals */
/* global io */
import EventEmitter from 'events';

import { chain, wait, ObjectUtils } from '@nti/lib-commons';
import Logger from '@nti/util-logger';

/** @typedef {import('../interface/DataServerInterface.js').default} DataServerInterface */
/** @typedef {() => void} Action */
/** @typedef {(...x: any[]) => void} Handler */
/** @typedef {(eventName: string, handler: Handler) => void} RegisterHandler */
/** @typedef {{ emit: (name: string, data: any, callback: Handler) => void; onPacket: Handler; on: RegisterHandler; removeAllListeners: Action; disconnect: Action; disconnectSync: Action }} SocketIO_Port */
/** @typedef {{ scope: any; [key: string]: string | Handler }} HandlerMapping */

const logger = Logger.get('websocket');
const SOCKET_IO_SRC = '/socket.io/static/socket.io.js';
const SESSION_ID = 'sessionId'.toLowerCase();

export default class WebSocketClient extends EventEmitter {
	//#region set up

	/** @type {DataServerInterface} */
	#server = null;

	/** @type {SocketIO_Port} */
	#socket = null;

	#disconnectStats = {
		count: 0,
	};

	/** @param {DataServerInterface} server */
	constructor(server) {
		super();

		this.#server = server;

		try {
			document.head.appendChild(
				Object.assign(document.createElement('script'), {
					id: 'socket-io-src',
					src: SOCKET_IO_SRC,
					async: true,
				})
			);
		} catch {
			throw new Error('SocketIO not available in this context');
		}

		global.addEventListener('beforeunload', () => {
			this.tearDown();
		});

		this.register({
			//connect: 'onConnect',
			reconnect: 'onReConnect',
			reconnecting: 'onReconnecting',
			reconnect_failed: 'onReConnectFailed',
			serverkill: 'onServerKill',
			error: 'onError',
			disconnect: 'onDisconnect',
			connecting: 'onConnecting',
			connect: 'onConnect',
			connect_failed: 'onConnectFailed',
		});
	}

	/**
	 * Destroy the socket.
	 *
	 * @returns {void}
	 */
	tearDown() {
		const port = this.#socket;
		try {
			if (port) {
				this.#socket = null;
				port.removeAllListeners();
				port.disconnect();

				//also can use this to synchronously disconnect, if we get extra messages after.
				//port.socket.disconnectSync();
			}
		} catch (e) {
			logger.error(
				'Could not tear down socket... it may not have existed'
			);
			logger.stack(e);
		}
	}

	/**
	 * @param {HandlerMapping} control
	 * @returns {void}
	 */
	register({ scope = this, ...control }) {
		for (let [eventName, handler] of Object.entries(control)) {
			if (typeof handler === 'string') {
				handler = scope[handler]?.bind(scope);
			}

			if (handler) {
				this.addListener(eventName, wrapHandler(handler, eventName));
			}
		}
	}

	/**
	 * @param {string} eventName
	 * @param  {Handler} handler
	 * @returns {void}
	 */
	addListener(eventName, handler) {
		this.setupForwarding(eventName);
		return super.addListener(eventName, handler);
	}

	setupForwarding(eventName) {
		const socket = this.#socket;
		// if socket is present ensure to listen to this event and reflect it here.
		if (socket && !(eventName in (socket.$events || {}))) {
			logger.trace('Registering event %s', eventName);
			socket?.on(eventName, (...args) => {
				logger.trace('Emitting event %s', eventName);
				return this.emit(eventName, ...args);
			});
		}
	}

	async setup() {
		await waitForSocketIO();
		const api = '';

		const socket = (this.#socket = io.connect(api, {
			'reconnection delay': getConfig('socketReconnectDelay', 2000),
		}));

		if (!socket.emit.chained) {
			socket.emit = chain(socket.emit, (...args) => {
				logger.trace('socket.emit: %O', args);
			});

			socket.onPacket = chain(socket.onPacket, (...args) => {
				if (args[0].type !== 'noop') {
					logger.trace('socket.onPacket: args: %O', args);
				}
			});
		}

		// iterate our registered events and add them to the socket.
		for (const eventName of Object.keys(this._events)) {
			this.setupForwarding(eventName);
		}

		this.emit('socket-available');
	}

	/**
	 * @param {() => void} callback
	 * @returns {void}
	 */
	onSocketAvailable(callback) {
		if (this.#socket) {
			return void callback();
		}
		this.once('socket-available', () => callback());
	}

	/**
	 * @param {string} event
	 * @param {*} data
	 * @param {() => void} callback
	 * @param  {...any} extra
	 * @returns {void}
	 */
	send(event, data, callback, ...extra) {
		const socket = this.#socket;

		try {
			socket?.emit(event, data, callback, ...extra);
		} catch (e) {
			logger.stack(e);
		}

		if (!socket) {
			logger.trace('dropping emit, socket is down');
			callback?.call();
		}
	}

	//#endregion

	//#region Handlers
	onError() {
		// If we get called during handshake thats it, the socket is kaput.
		// Attempt to reconnect with an exponential back off.
		logger.trace('ERROR: socket error. Details: %O', arguments);
	}

	onServerKill() {
		logger.trace('server kill');
		// Original implementation deferred this 1ms...
		// We're not planning on changing that behavior without reason.
		setTimeout(() => this.tearDownSocket(), 1);
	}

	onDisconnect(...args) {
		logger.trace(
			'Socket Disconnect count %d. Details: %O',
			++this.#disconnectStats.count,
			args
		);
	}

	onReconnecting(...args) {
		logger.trace('Reconnecting. Details: %O', args);
	}

	onReconnect(...args) {
		logger.trace('Reconnect. Details: %O', args);
	}

	onReconnectFailed(...args) {
		logger.error('Reconnect failed. Details: %O', args);
	}

	onConnecting(transportName) {
		logger.debug('Connecting with transport %s', transportName);
	}

	onConnected() {
		const { socket } = this.#socket;
		const newSessionId = socket[SESSION_ID];

		if (this.sessionId !== newSessionId) {
			logger.debug('New Socket Session Id: ', newSessionId);

			if (this.sessionId) {
				this.emit(
					'socket-new-session-id',
					newSessionId,
					this.sessionId
				);
			}

			this.sessionId = newSessionId;
		} else {
			logger.info('Same Socket Session Id: ' + this.sessionId);
		}

		if (this.isDebug) {
			logger.info('Connected with transport', socket.transport.name);
		}
	}

	onConnectFailed(...args) {
		logger.error('Socket connection failed. Details %O', args);
	}
	//#endregion
}

//#region tools

async function waitForSocketIO() {
	while (!global.io) {
		await wait(200);
	}
}

function wrapHandler(handler, name) {
	return (...args) =>
		//prevent the promise from reaching socket.io
		void (async () => {
			try {
				await handler(...args);
			} catch (e) {
				logger.error(
					'Caught an uncaught exception when taking action on %s',
					name
				);
				logger.stack(e);
			}
		})();
}

// I don't want to import/tie web-client to lib-interfaces just for this
// function... For this very special case, I'll break the $AppScript
// reference rule (do not reference $AppScript) ...
function getConfig(key, defaultValue) {
	return ObjectUtils.get(global.$AppConfig, key) ?? defaultValue;
}

//#endregion
