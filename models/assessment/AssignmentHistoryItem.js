import Base from '../Base';
import {
	Parser as parse
} from '../../CommonSymbols';

export default class AssignmentHistoryItem extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);
		for(let prop of ['Feedback','Grade','Submission','pendingAssessment']) {
			this[prop] = data[prop] && this[parse](data[prop]);
		}
	}


	getQuestions () {
		var submission = this.pendingAssessment || this.Submission;
		return submission ? submission.getQuestions() : [];
	}


	isSubmitted () {
		return !!this.Submission;
	}


	isGradeExcused () {
		var g = this.Grade || false;
		return g && g.isExcused();
	}


	getGradeValue () {
		var g = this.Grade;
		return g && g.getValue();
	}

}
