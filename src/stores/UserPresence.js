import EventEmitter from 'events';

import Logger from '@nti/util-logger';

import PresenceInfo from '../models/entities/PresenceInfo.js';
import User from '../models/entities/User.js';

const logger = Logger.get('user-presence');
const Placeholder = Symbol('Placeholder Presence Info');
export class UserPresence extends EventEmitter {
	/** @type {Object.<string,UserPresence>} */
	#presence = {};

	constructor() {
		super();
		this.setMaxListeners(0);
	}

	/**
	 * @returns {Iterable<PresenceInfo>}
	 */
	[Symbol.iterator]() {
		return Object.values(this.#presence)[Symbol.iterator]();
	}

	/**
	 * Updates the presence info for the given user.
	 *
	 * @param {string} username
	 * @param {PresenceInfo} presenceInfo
	 */
	setPresence(username, presenceInfo) {
		const oldPresence = this.#presence[username];

		if (presenceInfo) {
			logger.debug('New presence for: %s. %o', username, presenceInfo);
			this.#presence[username] = presenceInfo;
		} else {
			logger.debug('Drop presence for: %s', username);
			delete this.#presence[username];
		}
		this.emit('change');

		if (
			!oldPresence ||
			(presenceInfo && !oldPresence.equal(presenceInfo))
		) {
			this.emit('presence-changed', username, presenceInfo, oldPresence);
		}
	}

	/**
	 *
	 * @param {string|User} user
	 * @returns {PresenceInfo}
	 */
	getPresence(user) {
		const username = user?.getID?.() || user;

		return username ? this.#presence[username] : null;
	}

	/**
	 *
	 * @param {User} user
	 */
	__ensure(user) {
		const info =
			this.getPresence(user) ||
			Object.assign(PresenceInfo.from(user), { [Placeholder]: true });
		this.setPresence(info.username, info);
	}

	/**
	 * remove info from the store.
	 *
	 * @protected
	 * @param {string|PresenceInfo} info
	 */
	__dropPlaceholder(info) {
		const { username = info } = info;
		if (typeof username !== 'string') {
			throw new Error('Invalid argument.');
		}

		info = this.getPresence(username);
		if (info?.[Placeholder]) {
			this.setPresence(username, null);
		}
	}
}

export default new UserPresence();
