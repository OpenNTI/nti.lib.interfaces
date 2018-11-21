import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class UserCalendar extends Base {
	static MimeType = `${COMMON_PREFIX}calendar.usercalendar`

	static Fields = {
		...Base.Fields,
	}
}
