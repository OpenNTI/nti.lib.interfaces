import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import Preference from './Preference.js';

class SortCourses extends Preference {
	static MimeType = COMMON_PREFIX + 'preference.sort.courses';

	// prettier-ignore
	static Fields = {
		...Preference.Fields,
		'administered':  { type: 'model'  },
		'sortOn':        { type: 'string' },
		'sortDirection': { type: 'string' },
	}
}

export default decorate(SortCourses, { with: [model] });
