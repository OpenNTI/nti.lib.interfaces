import Registry, { COMMON_PREFIX } from '../Registry.js';

import { FilterSet } from './FilterSet.js';

export class CreatedTimeFilterSet extends FilterSet {
	static MimeType = COMMON_PREFIX + 'segments.createdtimefilterset';
	// prettier-ignore
	static Fields = {
		...super.Fields,
		// TODO: fill in class specific fields
	};
}

Registry.register(CreatedTimeFilterSet);
