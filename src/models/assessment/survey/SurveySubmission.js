import QuestionSetSubmission from '../QuestionSetSubmission';

import {
	Parser as parse
} from '../../../constants';

export default class SurveySubmission extends QuestionSetSubmission {

	static COURSE_SUBMISSION_REL = 'CourseInquiries'

	static build (survey) {
		const s = super.build(survey);
		s.surveyId = s.questionSetId;
		delete s.questionSetId;
		return s;
	}

	constructor (service, parent, data, submitTo) {
		super(service, parent, data, submitTo);
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
		return this.surveyId || this.NTIID;
	}
}
