import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

//TODO: does this need to live somewhere else
const DEFAULT_ICON = '/app/resources/images/elements/discussion-icon.png';

export default
@model
class CourseDiscussion extends Base {
	static MimeType = COMMON_PREFIX + 'courses.discussion'

	constructor (service, parent, data) {
		super(service, parent, data);
	}


	getIcon () {
		return this.icon || DEFAULT_ICON;
	}
}
