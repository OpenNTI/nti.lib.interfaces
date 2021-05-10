import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class CourseInvitations extends Base {
	static MimeType = [COMMON_PREFIX + 'courseware.courseinvitations'];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Items':     { type: 'model[]' }
	}
}

Registry.register(CourseInvitations);
