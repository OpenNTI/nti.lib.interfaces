import QuestionSubmission from '../QuestionSubmission';

export default class PollSubmission extends QuestionSubmission {
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
