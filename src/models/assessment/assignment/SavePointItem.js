import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
class SavePointItem extends Base {
	static MimeType = [
		COMMON_PREFIX + 'assessment.savepointitem',
		COMMON_PREFIX + 'assessment.userscourseassignmentsavepointitem',
	]

	static Fields = {
		...Base.Fields,
		'Submission': { type: 'model' }
	}


	getQuestions () {
		return this.Submission ? this.Submission.getQuestions() : [];
	}

	isSubmitted () { return false; }

}
