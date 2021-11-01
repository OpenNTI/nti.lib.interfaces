import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';

export default class SavePointItem extends Base {
	static MimeType = [
		COMMON_PREFIX + 'assessment.savepointitem',
		COMMON_PREFIX + 'assessment.userscourseassignmentsavepointitem',
	];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Submission': { type: 'model' }
	};

	getQuestions() {
		return this.Submission ? this.Submission.getQuestions() : [];
	}

	isSyntheticSubmission() {
		return false;
	}

	isSubmitted() {
		return false;
	}
}

Registry.register(SavePointItem);
