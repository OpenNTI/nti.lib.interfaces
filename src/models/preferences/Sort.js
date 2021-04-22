import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import Preference from './Preference.js';

class Sort extends Preference {
	static MimeType = [
		COMMON_PREFIX + 'preference.sort.books',
		COMMON_PREFIX + 'preference.sort.communities',
		COMMON_PREFIX + 'preference.sort.courses.administered',
	];

	// prettier-ignore
	static Fields = {
		...Preference.Fields,
		'sortOn':        { type: 'string'},
		'sortDirection': { type: 'string'},
	}
}

export default decorate(Sort, { with: [model] });
