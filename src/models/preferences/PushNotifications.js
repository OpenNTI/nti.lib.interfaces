import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class PreferencesPushNotifications extends Base {
	static MimeType = COMMON_PREFIX + 'preference.pushnotifications';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'Email':                       { type: 'model'   },
        'send_me_push_notifications':  { type: 'boolean' },
	}
}

export default decorate(PreferencesPushNotifications, { with: [model] });
