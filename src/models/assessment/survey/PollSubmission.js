import QuestionSubmission from '../QuestionSubmission';

export default class PollSubmission extends QuestionSubmission {
	static COURSE_SUBMISSION_REL = 'CourseInquiries'

	static build (poll) {
		const s = super.build(poll);
		s.pollId = s.questionId;
		delete s.questionId;
		return s;
	}


	constructor (service, parent, data, submitTo) {
		super(service, parent, data, submitTo);
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
