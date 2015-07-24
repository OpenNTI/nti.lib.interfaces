import Base from '../Base';
import {
	Parser as parse
} from '../../CommonSymbols';

export default class AssignmentHistoryItem extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);
		for(let prop of ['Feedback', 'Grade', 'Submission', 'pendingAssessment']) {
			this[parse](prop);
		}
	}


	getQuestions () {
		let submission = this.pendingAssessment || this.Submission;
		return submission ? submission.getQuestions() : [];
	}


	isSubmitted () {
		return !!this.Submission;
	}


	isGradeExcused () {
		let g = this.Grade || false;
		return g && g.isExcused();
	}


	getGradeValue () {
		let g = this.Grade;
		return g && g.getValue();
	}

}
