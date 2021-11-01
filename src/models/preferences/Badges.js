import Registry, { COMMON_PREFIX } from '../Registry.js';

import Preference from './Preference.js';

export default class BadgesCourse extends Preference {
	static MimeType = COMMON_PREFIX + 'preference.badges';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Course': {type: 'model'},
	};
}

Registry.register(BadgesCourse);
