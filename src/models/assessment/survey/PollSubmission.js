import Registry, { COMMON_PREFIX } from '../../Registry.js';
import QuestionSubmission from '../QuestionSubmission.js';
import { resolveSubmitTo } from '../utils.js';

export default class PollSubmission extends QuestionSubmission {
	static MimeType = COMMON_PREFIX + 'assessment.pollsubmission';
	static COURSE_SUBMISSION_REL = 'CourseInquiries';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'pollId': { type: 'string'  },
	}

	static build(poll) {
		const s = super.build(poll);

		s.pollId = s.questionId;

		delete s.questionId;

		const submitTo = resolveSubmitTo(poll, this.COURSE_SUBMISSION_REL);
		if (submitTo) {
			delete s.MimeType;
			s.MimeType = PollSubmission.MimeType;
			Object.defineProperties(s, {
				SubmissionHref: { value: submitTo },
				SubmitsToObjectURL: { value: true },
			});
		}

		return s;
	}

	getID() {
		return this.pollId || this.NTIID;
	}

	canReset() {
		return !this.isSubmitted();
	}

	canSubmit() {
		const answered = p => p !== null;

		if (this.isSubmitted()) {
			return false;
		}

		return this.parts && this.parts.filter(answered).length > 0;
	}
}

Registry.register(PollSubmission);
