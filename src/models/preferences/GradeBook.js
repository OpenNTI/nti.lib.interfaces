import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import Preference from './Preference.js';

class GradeBook extends Preference {
	static MimeType = COMMON_PREFIX + 'preference.gradebook';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'hide_avatars': { type: 'boolean' },
	}
}

export default decorate(GradeBook, [model]);
