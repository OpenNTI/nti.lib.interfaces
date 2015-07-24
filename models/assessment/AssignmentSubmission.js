import Base from '../Base';
import {
	Parser as parse
} from '../../CommonSymbols';

import Submission from '../mixins/Submission';

export default class AssignmentSubmission extends Base {

	static build (service, data) {
		return new this(service, null, data);
	}

	constructor (service, parent, data) {
		super(service, parent, data, Submission, {
			MimeType: 'application/vnd.nextthought.assessment.assignmentsubmission',
			SubmitsToObjectURL: true
		});

		// CreatorRecordedEffortDuration: 0
		this[parse]('parts', []);
	}


	getQuestion (id) {
		return this.parts.reduce((found, p) =>
			found || p.getQuestion(id), null);
	}


	getQuestions () {
		return this.parts.reduce((list, p) =>
			list.concat(p.getQuestions()), []);
	}


	countUnansweredQuestions (assignment) {
		//Verify argument is an Assignment model
		if (!assignment || !assignment.parts || assignment.parts.length !== this.parts.length) {
			throw new Error('Invalid Argument');
		}

		return this.parts.reduce((sum, q, i) =>
			sum + q.countUnansweredQuestions(assignment.parts[i].question_set), 0);
	}
}
