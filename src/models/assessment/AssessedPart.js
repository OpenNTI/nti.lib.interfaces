import assessed from '../../mixins/AssessedAssessmentPart.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

export default class AssessedPart extends assessed(Base) {
	static MimeType = COMMON_PREFIX + 'assessment.assessedpart';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'assessedValue':     { type: 'number'  },
		'solutions':         { type: 'model[]' },
		'submittedResponse': { type: '*'       }, // this can be various types, numbers, objects, etc
		'explanation':       { type: 'string'  }
	};

	getQuestionId() {
		return this.parent().getID();
	}

	getPartIndex() {
		let p = this.parent() || {};
		let items = p.parts || [];
		return items.indexOf(this);
	}

	isCorrect() {
		let a = this.assessedValue;
		//true, false, or null (if the assessedValue is not a number, return null)
		return typeof a === 'number' ? a === 1 : null;
	}
}

Registry.register(AssessedPart);
