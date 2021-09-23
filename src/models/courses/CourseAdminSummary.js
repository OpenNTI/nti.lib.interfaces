import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class CourseAdminSummary extends Base {
	static MimeType = COMMON_PREFIX + 'courseadminsummary';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		username: {type: 'string'},
		user: {type: 'model'}
	}
}

Registry.register(CourseAdminSummary);
