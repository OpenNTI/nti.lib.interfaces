import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';

export default class InquiryItemResponse extends Base {
	static MimeType =
		COMMON_PREFIX + 'assessment.userscourseinquiryitemresponse';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Aggregated': { type: 'model' },
		'Submission': { type: 'model'  },
	};

	getQuestions() {
		let submission = this.Submission;
		return !submission ? [] : submission.getQuestions();
	}

	isSubmitted() {
		return !!this.Submission || this.Aggregated;
	}
}

Registry.register(InquiryItemResponse);
