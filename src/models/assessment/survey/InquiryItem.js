import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
class InqueryItem extends Base {
	static MimeType = [
		COMMON_PREFIX + 'assessment.inquiryitem',
		COMMON_PREFIX + 'assessment.userscourseinquiryitem',
	]

	static Fields = {
		...Base.Fields,
		'Submission':        { type: 'model' },
		'CatalogEntryNTIID': { type: 'string'  },
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
