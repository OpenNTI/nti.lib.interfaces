import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry';
import Base from '../Base';

class UserCalendar extends Base {
	static MimeType = `${COMMON_PREFIX}calendar.usercalendar`;

	// prettier-ignore
	static Fields = {
		...Base.Fields,
	}
}

export default decorate(UserCalendar, { with: [model] });
