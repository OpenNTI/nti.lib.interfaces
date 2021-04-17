import EventEmitter from 'events';

import PresenceInfo from '../models/entities/PresenceInfo.js';
import User from '../models/entities/User.js';

function isSamePresence(a, b) {
	const fields = ['username', 'type', 'show', 'status'];

	for (let field of fields) {
		if (a[field] !== b[field]) {
			return false;
		}
	}

	return true;
}

export class UserPresence extends EventEmitter {
	/** @type {Object.<string,UserPresence>} */
	#presence = {};

	constructor() {
		super();
		this.setMaxListeners(0);
	}

	/** @deprecated Use setPresence instead*/
	setPresenceFor = this.setPresence;

	/**
	 * Updates the presence info for the given user.
	 *
	 * @param {string} username
	 * @param {PresenceInfo} presenceInfo
	 */
	setPresence(username, presenceInfo) {
		const oldPresence = this.#presence[username];

		this.#presence[username] = presenceInfo;

		if (!oldPresence || !isSamePresence(oldPresence, presenceInfo)) {
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
}

export default new UserPresence();
