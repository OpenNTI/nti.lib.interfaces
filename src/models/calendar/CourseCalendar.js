import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class CourseCalendar extends Base {
	static MimeType = `${COMMON_PREFIX}courseware.coursecalendar`

	static Fields = {
		...Base.Fields,
		'title':       { type: 'string' }
	}
}
