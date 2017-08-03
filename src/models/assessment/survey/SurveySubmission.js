import {Parser as parse} from '../../../constants';
import {model, COMMON_PREFIX} from '../../Registry';
import QuestionSetSubmission from '../QuestionSetSubmission';
import {resolveSubmitTo} from '../utils';

export default
@model
class SurveySubmission extends QuestionSetSubmission {
	static MimeType = COMMON_PREFIX + 'assessment.surveysubmission'
	static COURSE_SUBMISSION_REL = 'CourseInquiries'

	static build (survey) {
		const s = super.build(survey);

		s.surveyId = s.questionSetId;
		delete s.questionSetId;

		const submitTo = resolveSubmitTo(survey, this.COURSE_SUBMISSION_REL);
		if (submitTo) {
			Object.defineProperty(s, 'SubmissionHref', {value: submitTo});
		}

		return s;
	}

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
		return this.surveyId || this.NTIID;
	}
}
