import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../../Registry';
import QuestionSetSubmission from '../QuestionSetSubmission';
import {resolveSubmitTo} from '../utils';

class SurveySubmission extends QuestionSetSubmission {
	static MimeType = COMMON_PREFIX + 'assessment.surveysubmission'
	static COURSE_SUBMISSION_REL = 'CourseInquiries'

	static Fields = {
		...QuestionSetSubmission.Fields,
		'parts':    { type: 'model[]', defaultValue: [] },
		'surveyId': { type: 'string'                    },
		'version':  { type: 'string'                    }
	}


	static build (survey) {
		const s = super.build(survey);

		s.surveyId = s.questionSetId;
		delete s.questionSetId;

		const submitTo = resolveSubmitTo(survey, this.COURSE_SUBMISSION_REL);
		if (submitTo) {
			delete s.MimeType;
			s.MimeType = SurveySubmission.MimeType;
			Object.defineProperties(s,{
				SubmissionHref: { value: submitTo },
				SubmitsToObjectURL: { value: true }
			});
		}

		return s;
	}


	canReset () { return !this.isSubmitted(); }


	getID () {
		return this.surveyId || this.NTIID;
	}
}

export default decorate(SurveySubmission, {with:[model]});
