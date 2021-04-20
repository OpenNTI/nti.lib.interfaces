import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class PreferencesPushNotifications extends Base {
	static MimeType = COMMON_PREFIX + 'preference.pushnotifications.email';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'email_a_summary_of_interesting_changes': { type: 'boolean' },
		'immediate_threadable_reply':             { type: 'boolean' },
		'notify_on_mention':                      { type: 'boolean' },
	}
}

export default decorate(PreferencesPushNotifications, { with: [model] });
