import Base from '../Base';
import {Service} from '../../constants';
import Submission from '../mixins/Submission';

export default class QuestionSubmission extends Base {

	static build (question) {
		const {parts} = question;
		const data = {
			ContainerId: question.containerId,
			NTIID: question.getID(),
			questionId: question.getID(),
			parts: parts && parts.map(()=>null)
		};

		return new this(question[Service], null, data);
	}


	constructor (service, parent, data) {
		super(service, parent, data, Submission, {
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
