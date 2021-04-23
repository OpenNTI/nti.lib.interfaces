import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import Preference from './Preference.js';

class ChatPresence extends Preference {
	static MimeType = COMMON_PREFIX + 'preference.chatpresence';

	// prettier-ignore
	static Fields = {
		...Preference.Fields,
		'Active':    { type: 'model' },
		'Available': { type: 'model' },
        'Away':      { type: 'model' },
        'DND':       { type: 'model' },
	}
}

export default decorate(ChatPresence, [model]);
