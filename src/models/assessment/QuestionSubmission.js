import Base from '../Base';
import submission from '../mixins/Submission';

export default class QuestionSubmission extends Base {

	static build (service, data) {
		return new this(service, null, data);
	}


	constructor (service, parent, data) {

		super(service, parent, data, submission, {
			MimeType: 'application/vnd.nextthought.assessment.questionsubmission'
		});


		// questionId
		// parts -> parse
		// CreatorRecordedEffortDuration: 0
	}


	getID () {
		return this.NTIID || this.questionId;
	}


	getPartValue (index) {
		return this.parts[index];
	}


	setPartValue (index, value) {
		index = parseInt(index, 10);
		if (index < 0 || index >= (this.parts || []).length) {
			throw new Error('Index Out Of Bounds.');
		}

		this.parts[index] = value;
	}


	addRecordedEffortTime (/*duration*/) {
		// let old = this.CreatorRecordedEffortDuration || 0;
		// this.CreatorRecordedEffortDuration = old + duration;

		//Force/Blank this out for now.
		this.CreatorRecordedEffortDuration = null;
	}


	canSubmit () {
		const answered = p => p !== null;

		if (this.isSubmitted()) { return false; }

		return (this.parts || []).filter(answered).length > 0;
	}
}
