import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class UserCalendar extends Base {
	static MimeType = `${COMMON_PREFIX}calendar.usercalendar`;

	// prettier-ignore
	static Fields = {
		...super.Fields,
	}
}

Registry.register(UserCalendar);
