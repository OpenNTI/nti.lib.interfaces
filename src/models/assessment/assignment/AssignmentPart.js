import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

class AssignmentPart extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.assignmentpart'

	static Fields = {
		...Base.Fields,
		'question_set':  { type: 'model'   },
		'QuestionSetId': { type: 'string'  },
		'IsSummary':     { type: 'boolean' }
	}


	containsId (id) {
		const {question_set: o, QuestionSetId} = this;
		return QuestionSetId === id || (o && (o.getID() === id || o.containsId(id)));
	}

	getQuestion (id) {
		const {question_set: o} = this;
		return o && o.getQuestion(id);
	}


	getQuestions () {
		const {question_set: o} = this;
		return o ? o.getQuestions() : [];
	}


	getQuestionCount () {
		const {question_set: o} = this;
		return o ? o.getQuestionCount() : 0;
	}


	getSubmission () {
		const {question_set: o} = this;
		return o && o.getSubmission();
	}

}

export default decorate(AssignmentPart, {with:[model]});
