import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

//TODO: does this need to live somewhere else
const DEFAULT_ICON = '/app/resources/images/elements/discussion-icon.png';

export default
@model
class CourseDiscussion extends Base {
	static MimeType = COMMON_PREFIX + 'courses.discussion'

	static Fields = {
		...Base.Fields,
		'icon': { type: 'string' },
	}


	getIcon () {
		return this.icon || DEFAULT_ICON;
	}
}
