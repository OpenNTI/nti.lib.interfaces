import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

//TODO: does this need to live somewhere else
const DEFAULT_ICON = '/app/resources/images/elements/discussion-icon.png';

export default class CourseDiscussion extends Base {
	static MimeType = COMMON_PREFIX + 'courses.discussion';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'icon': { type: 'string' },
	};

	getIcon() {
		return this.icon || DEFAULT_ICON;
	}
}

Registry.register(CourseDiscussion);
