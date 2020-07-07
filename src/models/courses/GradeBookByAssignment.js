import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

class GradeBookByAssignmentSummary extends Base {
	static MimeType = [
		COMMON_PREFIX + 'gradebook.gradebookbyassignmentsummary',
		'GradeBookByAssignmentSummary' //ClassName fallback??
	]

	static Fields = {
		...Base.Fields,
		'Items': { type: 'model[]' },
	}

}

export default decorate(GradeBookByAssignmentSummary, {with:[model]});
