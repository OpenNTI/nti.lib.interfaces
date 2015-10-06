import Base from '../../../Base';
import {Parser as parse} from '../../../../CommonSymbols';

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
}
