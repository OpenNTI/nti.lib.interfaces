import Registry, { COMMON_PREFIX } from '../Registry.js';

import { FilterSet } from './FilterSet.js';

export class CourseMembershipFilterSet extends FilterSet {
	static MimeType =
		COMMON_PREFIX + 'courseware.segments.coursemembershipfilterset';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'course_ntiid': { type: 'string' },
		'operator':     { type: 'string' },
	};
}

Registry.register(CourseMembershipFilterSet);
