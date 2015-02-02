import Base from '../Base';
import {
	Parser as parse
} from '../../CommonSymbols';

import submission from '../mixins/Submission';

export default class QuestionSetSubmission extends Base {

	static build(service, data) {
		return new this(service, null, data);
	}

	constructor (service, parent, data) {
		super(service, parent, data, submission, {
			MimeType: 'application/vnd.nextthought.assessment.questionsetsubmission'
		});

		// CreatorRecordedEffortDuration: 0

		this.questions = this.questions.map(q =>this[parse](q));
	}


	getQuestion (id) {
		return this.questions.reduce((found, q) => found || (q.getID() === id && q), null);
	}

	getQuestions () {
		return this.questions.slice();
	}

	countUnansweredQuestions (questionSet) {
		if (!questionSet || !questionSet.questions || questionSet.questions.length !== this.questions.length) {
			throw new Error('Invalid Argument');
		}

		return this.questions.reduce((sum, q) =>
			sum + (questionSet.getQuestion(q.getID()).isAnswered(q) ? 0 : 1), 0);
	}
}
