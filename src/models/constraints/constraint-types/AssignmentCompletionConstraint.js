import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Model.js';

export default class AssignmentCompletionConstraint extends Base {
	static MimeType = COMMON_PREFIX + 'lesson.assignmentcompletionconstraint';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'assignments': { type: 'string[]'}
	};

	hasConstraintFor(itemOrId) {
		const { assignments } = this;
		const id = itemOrId.getID ? itemOrId.getID() : itemOrId;

		return assignments && assignments.some(assignment => assignment === id);
	}
}

Registry.register(AssignmentCompletionConstraint);
