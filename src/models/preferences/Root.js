import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class PreferenceRoot extends Base {
	static MimeType = COMMON_PREFIX + 'preference.root';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'ChatPresence':      { type: 'model' },
		'Gradebook':         { type: 'model' },
		'PushNotifications': { type: 'model' },
		'WebApp':            { type: 'model' },
	}
}

export default decorate(PreferenceRoot, { with: [model] });
