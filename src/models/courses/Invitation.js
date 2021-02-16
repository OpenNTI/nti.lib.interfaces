import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry';
import Base from '../Base';

class CourseInvitation extends Base {
	static MimeType = [
		COMMON_PREFIX + 'courseware.courseinvitation',
		COMMON_PREFIX + 'invitations.courseinvitation',
	];

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'Code':        { type: 'string' },
		'Description': { type: 'string' }
	}
}

export default decorate(CourseInvitation, { with: [model] });
