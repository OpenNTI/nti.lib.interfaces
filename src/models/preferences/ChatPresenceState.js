import { decorate, buffer } from '@nti/lib-commons';

import UserPresence from '../../stores/UserPresence.js';
import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';
import { Service } from '../../constants.js';
import PresenceInfo from '../entities/PresenceInfo.js';

class PreferenceChatPresenceState extends Base {
	static MimeType = [
		COMMON_PREFIX + 'preference.chatpresence.active',
		COMMON_PREFIX + 'preference.chatpresence.available',
		COMMON_PREFIX + 'preference.chatpresence.away',
		COMMON_PREFIX + 'preference.chatpresence.dnd',
	];

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'show':   { type: 'string' },
		'status': { type: 'string' },
		'type':   { type: 'string' },
	}

	constructor(service, parent, data) {
		super(service, parent, data);
		this.on('change', this.updatePresence);
	}

	updatePresence = buffer(100, () => {
		if (!/active$/i.test(this.MimeType)) {
			return;
		}

		const service = this[Service];

		UserPresence.setPresence(
			service.getAppUsername(),
			PresenceInfo.from(service, this.type, this.show, this.status)
		);
	});
}

export default decorate(PreferenceChatPresenceState, { with: [model] });
