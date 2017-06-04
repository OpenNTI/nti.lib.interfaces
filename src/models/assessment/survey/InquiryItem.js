import {Parser as parse} from '../../../constants';
import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

@model
export default class InqueryItem extends Base {
	static MimeType = [
		COMMON_PREFIX + 'assessment.inquiryitem',
		COMMON_PREFIX + 'assessment.userscourseinquiryitem',
	]

	constructor (service, parent, data) {
		super(service, parent, data);

		//CatalogEntryNTIID
		this[parse]('Submission');
	}

	getQuestions () {
		let submission = this.Submission;
		return !submission
			? []
			: submission.getQuestions
				? submission.getQuestions()
				: [submission];
	}


	isSubmitted () {
		return !!this.Submission;
	}
}
