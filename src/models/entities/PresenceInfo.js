import { decorate } from '@nti/lib-commons';

import Base from '../Base.js';
import { model, COMMON_PREFIX } from '../Registry.js';

class PresenceInfo extends Base {
	static MimeType = COMMON_PREFIX + 'presenceinfo';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'username': {type: 'string'},
		'type': {type: 'string'},
		'show': {type: 'string'},
		'status': {type: 'string'}
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
