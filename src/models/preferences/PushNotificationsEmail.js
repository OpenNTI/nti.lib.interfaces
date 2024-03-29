import Registry, { COMMON_PREFIX } from '../Registry.js';

import Preference from './Preference.js';

export default class PushNotificationsEmail extends Preference {
	static MimeType = COMMON_PREFIX + 'preference.pushnotifications.email';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'email_a_summary_of_interesting_changes': { type: 'boolean' },
		'immediate_threadable_reply':             { type: 'boolean' },
		'notify_on_mention':                      { type: 'boolean' },
	};
}

Registry.register(PushNotificationsEmail);
