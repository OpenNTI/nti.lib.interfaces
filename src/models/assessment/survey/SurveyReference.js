import {ASSESSMENT_HISTORY_LINK} from '../../../constants';
import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
class SurveyReference extends Base {
	static MimeType = COMMON_PREFIX + 'surveyref'

	static Fields = {
		...Base.Fields,
		'question-count': { type: 'number' },
	}


	get isSubmitted () {
		return this.hasLink(ASSESSMENT_HISTORY_LINK);
	}

	getQuestionCount () {
		return parseInt(this['question-count'], 10) || 0;
	}
}
