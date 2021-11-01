import Registry, { COMMON_PREFIX } from '../../../Registry.js';
import Base from '../../../Base.js';

export default class AggregatedSurveyResults extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.aggregatedsurvey';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'questions':        { type: 'model[]' },
		'surveyId':         { type: 'string'  },
		'ContainerContext': { type: '*'       },
	};

	getQuestions() {
		return this.questions;
	}

	getQuestion(id) {
		return this.questions.reduce(
			(found, q) => found || (q.getID() === id && q),
			null
		);
	}
}

Registry.register(AggregatedSurveyResults);
