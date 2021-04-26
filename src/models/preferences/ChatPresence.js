import Registry, { COMMON_PREFIX } from '../Registry.js';

import Preference from './Preference.js';

export default class ChatPresence extends Preference {
	static MimeType = COMMON_PREFIX + 'preference.chatpresence';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Active':    { type: 'model' },
		'Available': { type: 'model' },
        'Away':      { type: 'model' },
        'DND':       { type: 'model' },
	}
}

Registry.register(ChatPresence);
