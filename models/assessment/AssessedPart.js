import Base from '../Base';
import {
	Parser as parse
} from '../../CommonSymbols';

import assessed from '../mixins/AssessedAssessmentPart';

export default class AssessedPart extends Base {
	constructor (service, parent, data) {
		super(service, parent, data, assessed);
		this[parse]('solutions');
	}

	getQuestionId () {
		return this.parent().getID();
	}


	getPartIndex () {
		return this.parent().parts.indexOf(this);
	}


	isCorrect () {
		let a = this.assessedValue;
		//true, false, or null (if the assessedValue is not a number, return null)
		return typeof a === 'number' ? a === 1 : null;
	}
}
