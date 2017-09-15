import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
class InqueryItemResponse extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.userscourseinquiryitemresponse'

	static Fields = {
		...Base.Fields,
		'Aggregated': { type: 'model' },
		'Submission': { type: 'model'  },
	}


	getQuestions () {
		let submission = this.Submission;
		return !submission ? [] : submission.getQuestions();
	}


	isSubmitted () {
		return !!this.Submission || this.Aggregated;
	}
}
