import Registry, { COMMON_PREFIX } from '../../Registry.js';
import QuestionSetSubmission from '../QuestionSetSubmission.js';
import { resolveSubmitTo } from '../utils.js';

export default class SurveySubmission extends QuestionSetSubmission {
	static MimeType = COMMON_PREFIX + 'assessment.surveysubmission';
	static COURSE_SUBMISSION_REL = 'CourseInquiries';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'parts':    { type: 'model[]', defaultValue: [] },
		'surveyId': { type: 'string'                    },
		'version':  { type: 'string'                    }
	}

	static build(survey) {
		const s = super.build(survey);

		s.surveyId = s.questionSetId;
		delete s.questionSetId;

		const submitTo = resolveSubmitTo(survey, this.COURSE_SUBMISSION_REL);
		if (submitTo) {
			s.MimeType = SurveySubmission.MimeType;
			Object.defineProperties(s, {
				SubmissionHref: { value: submitTo },
				SubmitsToObjectURL: { value: true },
			});
		}

		return s;
	}

	canReset() {
		return !this.isSubmitted();
	}

	getID() {
		return this.surveyId || this.NTIID;
	}
}

Registry.register(SurveySubmission);
