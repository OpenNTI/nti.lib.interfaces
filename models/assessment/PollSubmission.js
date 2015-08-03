import QuestionSubmission from './QuestionSubmission';

export default class PollSubmission extends QuestionSubmission {
	constructor (service, parent, data) {
		super(service, parent, data);
		Object.assign(this, {
			MimeType: 'application/vnd.nextthought.assessment.pollsubmission',
			SubmitsToObjectURL: true
		});
	}

	getID () {
		return this.NTIID || this.pollId;
	}


	canReset () { return !this.isSubmitted(); }


	canSubmit () {
		const answered = p => p !== null;

		if (this.isSubmitted()) { return false; }

		return this.parts.filter(answered).length > 0;
	}
}
