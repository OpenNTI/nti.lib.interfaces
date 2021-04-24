import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class CourseInvitations extends Base {
	static MimeType = [COMMON_PREFIX + 'courseware.courseinvitations'];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Items':     { type: 'model[]' }
	}
}

export default decorate(CourseInvitations, [model]);
