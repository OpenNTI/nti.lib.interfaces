import Base from '../Base';

//TODO: does this need to live somewhere else
const DEFAULT_ICON = '/app/resources/images/elements/discussion-icon.png';

export default class CourseDiscussion extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);
	}


	getIcon () {
		return this.icon || DEFAULT_ICON;
	}
}
