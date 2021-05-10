import { isEmpty } from '@nti/lib-commons';

import { Service } from '../../constants.js';
import Base from '../Base.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';

import User from './User.js';

/** @typedef {import('../../stores/Service').default} ServiceDocument */

export default class PresenceInfo extends Base {
	static MimeType = COMMON_PREFIX + 'presenceinfo';

	/**
	 *
	 * @param {ServiceDocument|User} service
	 * @param {string|PresenceInfo} [type]
	 * @param {string} [show]
	 * @param {string} [status]
	 * @returns {PresenceInfo}
	 */
	static from(service, type, show, status) {
		const explicitUser = service instanceof User;
		const username = explicitUser
			? service.getID()
			: service.getAppUsername();

		// Service has a self-pointer on [Service] so we can do this when we may have a model:
		service = service[Service];
		type = type || 'unavailable';

		return new PresenceInfo(service, null, {
			MimeType: PresenceInfo.MimeType,
			username,
			...(type.getData?.() || {
				type,
			}),
			//if we have an explicit user, force it, otherwise, let it be as is (app user or inherited from PresenceInfo)
			...(explicitUser ? { username } : null),
			// Allow show and status to override values given prior (if type is another PresenceInfo)
			...(show == null ? show : { show }),
			...(status == null ? status : { status }),
		});
	}

	static isEqual(a, b) {
		const fields = ['username', 'type', 'show', 'status'];

		for (let field of fields) {
			if (a?.[field] !== b?.[field]) {
				return false;
			}
		}

		return true;
	}

	equal(other) {
		return PresenceInfo.isEqual(this, other);
	}

	from(data) {
		return Object.assign(this.clone(), data);
	}

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'username': { type: 'string' },
		'type':     { type: 'string' },
		'show':     { type: 'string' },
		'status':   { type: 'string' },
		// populate a source for a presence info... if it comes from the socket, or from the user/preference-change
		'source':   { type: 'string' },
	}

	get name() {
		return this.getName();
	}

	get isPresenceInfo() {
		return true;
	}

	get isForAppUser() {
		return this.isAppUser(this.username);
	}

	toString() {
		return this.isOnline() ? 'Online' : 'Offline';
	}

	isOnline() {
		return this.type !== 'unavailable';
	}

	getName() {
		const { show } = this;

		if (!this.isOnline()) {
			return 'unavailable';
		}

		if (show === 'chat') {
			return 'available';
		}

		if (show === 'xa') {
			return 'invisible';
		}

		return show;
	}

	getDisplayText() {
		const nameToDisplay = {
			dnd: 'Do not disturb',
			away: 'Away',
			available: 'Available',
			unavailable: '',
			invisible: 'Invisible',
		};

		const { status } = this;

		if (!this.isOnline()) {
			return '';
		}

		if (!isEmpty(status) && status !== 'null') {
			return status;
		}

		return nameToDisplay[this.getName()];
	}
}

Registry.register(PresenceInfo);
