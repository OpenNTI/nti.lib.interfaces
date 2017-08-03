import {mixin} from 'nti-lib-decorators';

import {Parser as parse} from '../../constants';
import assessed from '../../mixins/AssessedAssessmentPart';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
@mixin(assessed)
class AssessedQuestion extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.assessedquestion'

	constructor (service, parent, data) {
		super(service, parent, data);

		this[parse]('parts', []);
	}


	getID () {
		return this.questionId || this.NTIID;
	}


	isSubmitted () {
		return true;
	}


	isCorrect () {
		let p = this.parts || [],
			i = p.length - 1, v;

		for (i; i >= 0; i--) {
			v = p[i].isCorrect();
			if (!v) {
				return v;
			}
		}

		return true;
	}
}
