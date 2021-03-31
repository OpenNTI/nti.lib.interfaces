import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class GradeBookByAssignmentSummary extends Base {
	static MimeType = [
		COMMON_PREFIX + 'gradebook.gradebookbyassignmentsummary',
		'GradeBookByAssignmentSummary', //ClassName fallback??
	];

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'Items': { type: 'model[]' },
	}
}

export default decorate(GradeBookByAssignmentSummary, { with: [model] });
