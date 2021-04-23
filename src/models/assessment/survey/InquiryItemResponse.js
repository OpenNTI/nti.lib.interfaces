import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';

class InquiryItemResponse extends Base {
	static MimeType =
		COMMON_PREFIX + 'assessment.userscourseinquiryitemresponse';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'Aggregated': { type: 'model' },
		'Submission': { type: 'model'  },
	}

	getQuestions() {
		let submission = this.Submission;
		return !submission ? [] : submission.getQuestions();
	}

	isSubmitted() {
		return !!this.Submission || this.Aggregated;
	}
}

export default decorate(InquiryItemResponse, [model]);
