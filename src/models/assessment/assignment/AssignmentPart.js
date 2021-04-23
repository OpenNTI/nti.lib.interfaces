import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';

class AssignmentPart extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.assignmentpart';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'question_set':  { type: 'model'   },
		'QuestionSetId': { type: 'string'  },
		'IsSummary':     { type: 'boolean' }
	}

	containsId(id) {
		const { question_set: o, QuestionSetId } = this;
		return (
			QuestionSetId === id ||
			(o && (o.getID() === id || o.containsId(id)))
		);
	}

	getQuestion(id) {
		const { question_set: o } = this;
		return o && o.getQuestion(id);
	}

	getQuestions() {
		const { question_set: o } = this;
		return o ? o.getQuestions() : [];
	}

	getQuestionCount() {
		const { question_set: o } = this;
		return o ? o.getQuestionCount() : 0;
	}

	getSubmission() {
		const { question_set: o } = this;
		return o && o.getSubmission();
	}
}

export default decorate(AssignmentPart, [model]);
