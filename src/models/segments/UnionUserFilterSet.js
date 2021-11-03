import Registry, { COMMON_PREFIX } from '../Registry.js';

import { FilterSet } from './FilterSet.js';

export class UnionUserFilterSet extends FilterSet {
	static MimeType = COMMON_PREFIX + 'segments.unionuserfilterset';
}

Registry.register(UnionUserFilterSet);
