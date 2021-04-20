import { decorate, URL as URLUtils } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class PreferencesChatPresence extends Base {
	static MimeType = COMMON_PREFIX + 'preference.chatpresence';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'Active':    { type: 'model' },
		'Available': { type: 'model' },
        'Away':      { type: 'model' },
        'DND':       { type: 'model' },
	}

	get href() {
		const p = this.parent();
		return URLUtils.join(p.href, p.findField(this));
	}
}

export default decorate(PreferencesChatPresence, { with: [model] });
