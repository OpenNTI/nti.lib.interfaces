import Registry, { COMMON_PREFIX } from '../Registry.js';

import Preference from './Preference.js';

export default class Sort extends Preference {
	static MimeType = [
		COMMON_PREFIX + 'preference.sort.books',
		COMMON_PREFIX + 'preference.sort.communities',
		COMMON_PREFIX + 'preference.sort.courses.administered',
	];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'sortOn':    { type: 'string'},
		'sortOrder': { type: 'string'},
	};
}

Registry.register(Sort);
