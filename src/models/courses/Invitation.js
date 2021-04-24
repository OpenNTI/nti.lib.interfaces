import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class CourseInvitation extends Base {
	static MimeType = [
		COMMON_PREFIX + 'courseware.courseinvitation',
		COMMON_PREFIX + 'invitations.courseinvitation',
	];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Code':        { type: 'string' },
		'Description': { type: 'string' }
	}
}

export default decorate(CourseInvitation, [model]);
