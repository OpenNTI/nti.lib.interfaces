import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

export default class GradeBookByAssignmentSummary extends Base {
	static MimeType = [
		COMMON_PREFIX + 'gradebook.gradebookbyassignmentsummary',
		'GradeBookByAssignmentSummary', //ClassName fallback??
	];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Items': { type: 'model[]' },
	};
}

Registry.register(GradeBookByAssignmentSummary);
