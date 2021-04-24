import assessed from '../../mixins/AssessedAssessmentPart.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class AssessedQuestion extends assessed(Base) {
	static MimeType = COMMON_PREFIX + 'assessment.assessedquestion';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'parts':      { type: 'model[]' },
		'questionId': { type: 'string'  },
	}

	getID() {
		return this.questionId || this.NTIID;
	}

	isSubmitted() {
		return true;
	}

	isCorrect() {
		let p = this.parts || [],
			i = p.length - 1,
			v;

		for (i; i >= 0; i--) {
			v = p[i].isCorrect();
			if (!v) {
				return v;
			}
		}

		return true;
	}
}

Registry.register(AssessedQuestion);
