import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
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
