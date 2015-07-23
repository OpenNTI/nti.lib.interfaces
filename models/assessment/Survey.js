import QuestionSet from './QuestionSet';

export default class Survey extends QuestionSet {
	constructor (service, parent, data) {
		super(service, parent, data);
	}

	getSubmissionModel() {
		return this.getModel('assessment.surveysubmission');
	}
}
