import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class CourseInvitation extends Base {
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

Registry.register(CourseInvitation);
