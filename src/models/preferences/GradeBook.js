import Registry, { COMMON_PREFIX } from '../Registry.js';

import Preference from './Preference.js';

export default class GradeBook extends Preference {
	static MimeType = COMMON_PREFIX + 'preference.gradebook';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'hide_avatars': { type: 'boolean' },
	}
}

Registry.register(GradeBook);
