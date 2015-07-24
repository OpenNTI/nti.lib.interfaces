import QuestionSetSubmission from './QuestionSetSubmission';

import {
	Parser as parse
} from '../../CommonSymbols';

export default class SurveySubmission extends QuestionSetSubmission {
	constructor (service, parent, data) {
		super(service, parent, data);
		this.MimeType = 'application/vnd.nextthought.assessment.surveysubmission';

		this[parse]('parts');
	}

	getID () {
		return this.NTIID || this.surveyId;
	}
}
