import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import Preference from './Preference.js';

class PushNotifications extends Preference {
	static MimeType = COMMON_PREFIX + 'preference.pushnotifications';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Email':                       { type: 'model'   },
        'send_me_push_notifications':  { type: 'boolean' },
	}
}

export default decorate(PushNotifications, [model]);
