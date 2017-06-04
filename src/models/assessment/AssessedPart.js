import {Parser as parse} from '../../constants';
import assessed from '../../mixins/AssessedAssessmentPart';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

@model
export default class AssessedPart extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.assessedpart'

	constructor (service, parent, data) {
		super(service, parent, data, assessed);
		this[parse]('solutions');
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
