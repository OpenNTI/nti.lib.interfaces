import Registry, { COMMON_PREFIX } from '../Registry.js';

import { FilterSet } from './FilterSet.js';

export class LastActiveFilterSet extends FilterSet {
	static MimeType = COMMON_PREFIX + 'segments.lastactivefilterset';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		// TODO: fill in class specific fields
	};
}

Registry.register(LastActiveFilterSet);
