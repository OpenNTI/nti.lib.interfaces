import QuestionSetSubmission from '../QuestionSetSubmission';

import {
	Parser as parse
} from '../../../CommonSymbols';

export default class SurveySubmission extends QuestionSetSubmission {
	constructor (service, parent, data) {
		super(service, parent, data);
		Object.defineProperty(this, 'SubmitsToObjectURL', {value: true});
		Object.assign(this, {
			MimeType: 'application/vnd.nextthought.assessment.surveysubmission'
		});

		this[parse]('parts');
		if (!this.parts) {
			Object.defineProperty(this, 'parts', {value: []});
		}
	}


	canReset () { return !this.isSubmitted(); }


	getID () {
		return this.NTIID || this.surveyId;
	}
}
