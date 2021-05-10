import Registry, { COMMON_PREFIX } from '../Registry.js';

import Preference from './Preference.js';

export default class SortCourses extends Preference {
	static MimeType = COMMON_PREFIX + 'preference.sort.courses';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'administered':  { type: 'model'  },
		'sortOn':        { type: 'string' },
		'sortOrder':     { type: 'string' },
	}
}

Registry.register(SortCourses);
