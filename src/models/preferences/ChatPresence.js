import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class PreferenceChatPresence extends Base {
	static MimeType = COMMON_PREFIX + 'preference.chatpresence';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'Active':    { type: 'model' },
		'Available': { type: 'model' },
        'Away':      { type: 'model' },
        'DND':       { type: 'model' },
	}
}

export default decorate(PreferenceChatPresence, { with: [model] });
