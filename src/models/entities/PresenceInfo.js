import { decorate } from '@nti/lib-commons';

import Base from '../Base.js';
import { model, COMMON_PREFIX } from '../Registry.js';

class PresenceInfo extends Base {
	static MimeType = COMMON_PREFIX + 'presenceinfo';

	static from(service, type, show, status) {
		if (type instanceof PresenceInfo) {
			return new PresenceInfo(service, null, type.getData());
		}

		return new PresenceInfo(service, null, {
			MimeType: PresenceInfo.MimeType,
			username: service.getAppUsername(),
			type,
			show,
			status,
		});
	}

	from(data) {
		return Object.assign(this.clone(), data);
	}

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'username': { type: 'string' },
		'type':     { type: 'string' },
		'show':     { type: 'string' },
		'status':   { type: 'string' },
		// populate a source for a presence info... if it comes from the socket, or from the user/preference-change
		'source':   { type: 'string' },
	}

	get isPresenceInfo() {
		return true;
	}

	get isForAppUser() {
		return this.isAppUser(this.username);
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
}

export default decorate(PresenceInfo, { with: [model] });
