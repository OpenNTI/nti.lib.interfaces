import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import Preference from './Preference.js';

class SortGroups extends Preference {
	static MimeType = COMMON_PREFIX + 'preference.sort';

	// prettier-ignore
	static Fields = {
		...Preference.Fields,
		'courses':     { type: 'model' },
		'communities': { type: 'model' },
		'books':       { type: 'model' },
	}
}

export default decorate(SortGroups, { with: [model] });
