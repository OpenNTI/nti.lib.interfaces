import Base from '../../../Base';
import {Parser as parse} from '../../../../constants';

export default class AggregatedSurveyResults extends Base {

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
