import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class CourseInvitations extends Base {
	static MimeType = [
		COMMON_PREFIX + 'courseware.courseinvitations'
	]

	static Fields = {
		...Base.Fields,
		'Items':     { type: 'model[]' }
	}

}
