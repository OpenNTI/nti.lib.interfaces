import Base from '../../Base';
import {
	Parser as parse
} from '../../../constants';

export default class AssignmentHistoryItem extends Base {
	constructor (service, parent, data) {
		const rename = Symbol.for('TakeOver');
		super(service, parent, data);
		for(let prop of ['Feedback', 'Grade', 'Submission', 'pendingAssessment']) {
			this[parse](prop);
		}

		this[rename]('Grade', 'grade');
	}


	getQuestions () {
		let submission = this.pendingAssessment || this.Submission;
		return submission ? submission.getQuestions() : [];
	}


	get feedbackCount () {
		const {Feedback: list} = this;
		return (list || []).length;
	}


	get completed () {
		const {Submission: s = null} = this;
		return s && s.getCreatedTime();
	}


	isSubmitted () {
		return !!this.Submission;
	}


	isGradeExcused () {
		let g = this.grade || false;
		return g && g.isExcused();
	}


	isSyntheticSubmission () {
		return !!this.SyntheticSubmission;
	}


	getGradeValue () {
		let g = this.grade;
		return g && g.value;
	}

}
