import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class UserCalendar extends Base {
	static MimeType = `${COMMON_PREFIX}calendar.usercalendar`;

	// prettier-ignore
	static Fields = {
		...super.Fields,
	}
}

export default decorate(UserCalendar, [model]);
