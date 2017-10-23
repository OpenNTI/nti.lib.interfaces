import {mixin} from 'nti-lib-decorators';

import assessed from '../../mixins/AssessedAssessmentPart';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
@mixin(assessed)
class AssessedPart extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.assessedpart'

	static Fields = {
		...Base.Fields,
		'assessedValue':     { type: 'number'  },
		'solutions':         { type: 'model[]' },
		'submittedResponse': { type: '*'       }, // this can be various types, numbers, objects, etc
		'explanation':       { type: 'string'  }
	}


	getQuestionId () {
		return this.parent().getID();
	}


	getPartIndex () {
		let p = this.parent() || {};
		let items = p.parts || [];
		return items.indexOf(this);
	}


	isCorrect () {
		let a = this.assessedValue;
		//true, false, or null (if the assessedValue is not a number, return null)
		return typeof a === 'number' ? a === 1 : null;
	}
}
