import {Parser as parse} from '../../../constants';
import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
class InqueryItemResponse extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.userscourseinquiryitemresponse'

	constructor (service, parent, data) {
		super(service, parent, data);

		this[parse]('Aggregated');
		this[parse]('Submission');
	}

	getQuestions () {
		let submission = this.Submission;
		return !submission ? [] : submission.getQuestions();
	}


	isSubmitted () {
		return !!this.Submission || this.Aggregated;
	}
}
