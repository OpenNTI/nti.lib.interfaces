import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';

export default class InquiryItem extends Base {
	static MimeType = [
		COMMON_PREFIX + 'assessment.inquiryitem',
		COMMON_PREFIX + 'assessment.userscourseinquiryitem',
	];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Submission':        { type: 'model' },
		'CatalogEntryNTIID': { type: 'string'  },
	};

	getQuestions() {
		let submission = this.Submission;
		return !submission
			? []
			: submission.getQuestions
			? submission.getQuestions()
			: [submission];
	}

	isSubmitted() {
		return !!this.Submission;
	}
}

Registry.register(InquiryItem);
