import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';
import {
	Parser as parse
} from '../../constants';

@model
export default class GradeBookByAssignmentSummary extends Base {
	static MimeType = [
		COMMON_PREFIX + 'gradebook.gradebookbyassignmentsummary',
		'GradeBookByAssignmentSummary' //ClassName fallback??
	]

	constructor (service, parent, data) {
		super(service, parent, data);

		this[parse]('Items');
	}
}
