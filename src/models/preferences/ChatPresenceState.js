import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

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

	'translate:show'(show) {
		return show === 'offline' ? '' : show;
	}

	'beforeSet:status'(v) {
		if (this.isActive) {
			const { Active } = this.parent();
			Active.status = v;
		}
	}

	get isActive() {
		const { Active } = this.parent();
		return (
			this !== Active &&
			Active.show === this.show &&
			Active.status === this.status &&
			Active.type === this.type
		);
	}
}

export default decorate(PreferenceChatPresenceState, { with: [model] });
