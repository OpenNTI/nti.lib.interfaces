import {model, COMMON_PREFIX} from '../../Registry';
import QuestionSubmission from '../QuestionSubmission';
import {resolveSubmitTo} from '../utils';

export default
@model
class PollSubmission extends QuestionSubmission {
	static MimeType = COMMON_PREFIX + 'assessment.pollsubmission'
	static COURSE_SUBMISSION_REL = 'CourseInquiries'

	static build (poll) {
		const s = super.build(poll);

		s.pollId = s.questionId;

		delete s.questionId;

		const submitTo = resolveSubmitTo(poll, this.COURSE_SUBMISSION_REL);
		if (submitTo) {
			Object.defineProperty(s, 'SubmissionHref', {value: submitTo});
		}

		return s;
	}


	constructor (service, parent, data) {
		super(service, parent, data);
		Object.defineProperty(this, 'SubmitsToObjectURL', {value: true});
		Object.assign(this, {
			MimeType: 'application/vnd.nextthought.assessment.pollsubmission'
		});
	}

	getID () {
		return this.pollId || this.NTIID;
	}


	canReset () { return !this.isSubmitted(); }


	canSubmit () {
		const answered = p => p !== null;

		if (this.isSubmitted()) { return false; }

		return this.parts && this.parts.filter(answered).length > 0;
	}
}
