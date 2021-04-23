import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';

class AssignmentCompletionConstraint extends Base {
	static MimeType = COMMON_PREFIX + 'lesson.assignmentcompletionconstraint';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'assignments': { type: 'string[]'}
	}

	hasConstraintFor(itemOrId) {
		const { assignments } = this;
		const id = itemOrId.getID ? itemOrId.getID() : itemOrId;

		return assignments && assignments.some(assignment => assignment === id);
	}
}

export default decorate(AssignmentCompletionConstraint, [model]);
