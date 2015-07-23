import QuestionSet from './QuestionSet';

export default class Survey extends QuestionSet {
	constructor (service, parent, data) {
		super(service, parent, data);
	}

	getSubmissionModel() {
		return this.getModel('assessment.surveysubmission');
	}

	getSubmission () {
		let s = super.getSubmission();

		s.surveyId = s.questionSetId;
		delete s.questionSetId;

		return s;
	}

}
