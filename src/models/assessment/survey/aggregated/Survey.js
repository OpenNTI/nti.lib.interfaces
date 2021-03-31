import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../../Registry.js';
import Base from '../../../Base.js';

class AggregatedSurveyResults extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.aggregatedsurvey';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'questions':        { type: 'model[]' },
		'surveyId':         { type: 'string'  },
		'ContainerContext': { type: '*'       },
	}

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

export default decorate(AggregatedSurveyResults, { with: [model] });
