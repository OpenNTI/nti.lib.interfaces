import Base from '../Base';
import {
	Parser as parse
} from '../../CommonSymbols';

import assessed from '../mixins/AssessedAssessmentPart';

export default class AssessedQuestionSet extends Base {
	constructor (service, parent, data) {
		super(service, parent, data, assessed);
		this[parse]('questions');
	}

	getQuestion (id) {
		return this.questions.reduce((found, q) =>
			found || (q.getID() === id && q), null);
	}


	getQuestions () {
		return this.questions.slice();
	}


	isSubmitted () {
		return true;
	}


	getTotal () {
		return (this.questions || []).length;
	}


	getCorrect () {
		return (this.questions || []).reduce((sum, question) =>
			sum + (question.isCorrect() ? 1 : 0), 0);
	}


	getIncorrect () {
		return this.getTotal() - this.getCorrect();
	}


	getScore () {
		try {
			return 100 * (this.getCorrect() / this.getTotal());
		} catch (e) {
			return 0;
		}
	}
}
