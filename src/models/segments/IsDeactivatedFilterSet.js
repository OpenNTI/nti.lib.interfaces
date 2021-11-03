import Registry, { COMMON_PREFIX } from '../Registry.js';

import { FilterSet } from './FilterSet.js';

export class IsDeactivatedFilterSet extends FilterSet {
	static MimeType = COMMON_PREFIX + 'segments.isdeactivatedfilterset';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Deactivated': { type: 'boolean' },
	};
}

Registry.register(IsDeactivatedFilterSet);
