import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

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


	isSyntheticSubmission () {
		return false;
	}


	isSubmitted () { return false; }

}

export default decorate(SavePointItem, {with:[model]});
