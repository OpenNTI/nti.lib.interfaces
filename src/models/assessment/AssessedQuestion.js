import { decorate } from '@nti/lib-commons';
import { mixin } from '@nti/lib-decorators';

import assessed from '../../mixins/AssessedAssessmentPart.js';
import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class AssessedQuestion extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.assessedquestion';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
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

export default decorate(AssessedQuestion, { with: [model, mixin(assessed)] });
