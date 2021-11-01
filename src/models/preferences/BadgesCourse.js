import Registry, { COMMON_PREFIX } from '../Registry.js';

import Preference from './Preference.js';

export default class BadgesCourse extends Preference {
	static MimeType = COMMON_PREFIX + 'preference.badges.course';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'show_course_badges': {type: 'boolean'},
	};
}

Registry.register(BadgesCourse);
