import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
class AssignmentCompletionConstraint extends Base {
	static MimeType = COMMON_PREFIX + 'lesson.assignmentcompletionconstraint'

	static Fields = {
		...Base.Fields,
		'assignments': { type: 'string[]'}
	}

	hasConstraintFor (itemOrId) {
		const {assignments} = this;
		const id = itemOrId.getID ? itemOrId.getID() : itemOrId;

		return assignments && assignments.some(assignment => assignment === id);
	}
}