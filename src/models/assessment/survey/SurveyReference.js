import {ASSESSMENT_HISTORY_LINK} from '../../../constants';
import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

@model
export default class SurveyReference extends Base {
	static MimeType = COMMON_PREFIX + 'surveyref'

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
