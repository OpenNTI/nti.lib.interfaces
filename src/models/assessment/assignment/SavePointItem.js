import {Parser as parse} from '../../../constants';
import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

@model
export default class SavePointItem extends Base {
	static MimeType = [
		COMMON_PREFIX + 'assessment.savepointitem',
		COMMON_PREFIX + 'assessment.userscourseassignmentsavepointitem',
	]

	constructor (service, parent, data) {
		super(service, parent, data);

		this[parse]('Submission');
	}


	getQuestions () {
		return this.Submission ? this.Submission.getQuestions() : [];
	}

	isSubmitted () { return false; }

}
