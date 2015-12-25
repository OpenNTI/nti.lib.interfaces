import Base from '../../Base';

import {HISTORY_LINK} from '../Constants';

export default class SurveyReference extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);
	}

	get isSubmitted () {
		return this.hasLink(HISTORY_LINK);
	}

	getQuestionCount () {
		return parseInt(this['question-count'], 10) || 0;
	}
}
