import Registry, { COMMON_PREFIX } from '../Registry.js';

import Preference from './Preference.js';

export default class PushNotifications extends Preference {
	static MimeType = COMMON_PREFIX + 'preference.pushnotifications';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Email':                       { type: 'model'   },
        'send_me_push_notifications':  { type: 'boolean' },
	};
}

Registry.register(PushNotifications);
