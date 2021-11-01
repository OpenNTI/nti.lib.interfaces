import Registry, { COMMON_PREFIX } from '../Registry.js';

import Preference from './Preference.js';

export default class SortGroups extends Preference {
	static MimeType = COMMON_PREFIX + 'preference.sort';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'courses':     { type: 'model' },
		'communities': { type: 'model' },
		'books':       { type: 'model' },
	};
}

Registry.register(SortGroups);
