import Base from '../../Base';

export default class SurveyReference extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);
	}

	get isSubmitted () {
		return this.hasLink('History');
	}

	getQuestionCount () {
		return parseInt(this['question-count'], 10) || 0;
	}
}
