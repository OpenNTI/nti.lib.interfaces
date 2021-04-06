import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class PreferenceGradeBook extends Base {
	static MimeType = COMMON_PREFIX + 'preference.gradebook';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'hide_avatars': { type: 'boolean' },
	}
}

export default decorate(PreferenceGradeBook, { with: [model] });
