import Base from '../Base';
import {
	Parser as parse
} from '../../CommonSymbols';

export default class AssignmentPart extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);
		this.question_set = this[parse](this.question_set);
	}


	containsId (id) {
		var qSet = this.question_set;
		return qSet && (qSet.getID() === id || qSet.containsId(id));
	}

	getQuestion (id) {
		return this.question_set.getQuestion(id);
	}


	getQuestions () {
		return this.question_set.getQuestions();
	}


	getQuestionCount () {
		return this.question_set.getQuestionCount();
	}


	getSubmission () {
		return this.question_set.getSubmission();
	}

}
