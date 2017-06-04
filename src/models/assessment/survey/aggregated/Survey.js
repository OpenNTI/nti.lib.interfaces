import {Parser as parse} from '../../../../constants';
import {model, COMMON_PREFIX} from '../../../Registry';
import Base from '../../../Base';

@model
export default class AggregatedSurveyResults extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.aggregatedsurvey'

	constructor (service, parent, data) {
		super(service, parent, data);
		this[parse]('questions', []);

		// ContainerContext
		// surveyId
	}

	getQuestions () {
		return this.questions;
	}

	getQuestion (id) {
		return this.questions.reduce((found, q) =>
			found || (q.getID() === id && q), null);
	}
}
