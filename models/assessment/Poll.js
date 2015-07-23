import Question from './Question';

export default class Poll extends Question {
	constructor (service, parent, data) {
		super(service, parent, data);
	}


	getSubmissionModel() {
		return this.getModel('assessment.pollsubmission');
	}
}
