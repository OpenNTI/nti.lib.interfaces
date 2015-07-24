import QuestionSetSubmission from './QuestionSetSubmission';

import {
	Parser as parse
} from '../../CommonSymbols';

export default class SurveySubmission extends QuestionSetSubmission {
	constructor (service, parent, data) {
		super(service, parent, data);
		Object.assign(this, {
			MimeType: 'application/vnd.nextthought.assessment.surveysubmission',
			SubmitsToObjectURL: true
		});
		this[parse]('parts');
	}

	getID () {
		return this.NTIID || this.surveyId;
	}
}
