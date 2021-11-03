import Registry, { COMMON_PREFIX } from '../Registry.js';

import { FilterSet } from './FilterSet.js';

export class IntersectionUserFilterSet extends FilterSet {
	static MimeType = COMMON_PREFIX + 'segments.intersectionuserfilterset';
}

Registry.register(IntersectionUserFilterSet);
