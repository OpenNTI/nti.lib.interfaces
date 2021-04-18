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
}

export default decorate(PreferenceChatPresenceState, { with: [model] });
