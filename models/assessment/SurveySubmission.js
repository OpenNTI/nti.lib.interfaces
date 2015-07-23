import QuestionSetSubmission from './QuestionSetSubmission';

export default class SurveySubmission extends QuestionSetSubmission {
	constructor (service, parent, data) {
		super(service, parent, data);
		this.MimeType = 'application/vnd.nextthought.assessment.surveysubmission';
	}

	getID () {
		return this.NTIID || this.surveyId;
	}
}
