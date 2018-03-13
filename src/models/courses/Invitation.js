import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class CourseInvitation extends Base {
	static MimeType = [
		COMMON_PREFIX + 'courseware.courseinvitation',
		COMMON_PREFIX + 'invitations.courseinvitation'
	]

	static Fields = {
		...Base.Fields,
		'Code':        { type: 'string' },
		'Description': { type: 'string' }
	}

}
