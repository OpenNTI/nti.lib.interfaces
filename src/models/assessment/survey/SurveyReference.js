import Base from '../../Base';

import {ASSESSMENT_HISTORY_LINK} from '../../../constants';

export default class SurveyReference extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);
	}

	get isSubmitted () {
		return this.hasLink(ASSESSMENT_HISTORY_LINK);
	}

	getQuestionCount () {
		return parseInt(this['question-count'], 10) || 0;
	}
}
