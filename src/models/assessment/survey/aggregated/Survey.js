import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../../../Registry';
import Base from '../../../Base';

class AggregatedSurveyResults extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.aggregatedsurvey'

	static Fields = {
		...Base.Fields,
		'questions':        { type: 'model[]' },
		'surveyId':         { type: 'string'  },
		'ContainerContext': { type: '*'       },
	}


	getQuestions () {
		return this.questions;
	}

	getQuestion (id) {
		return this.questions.reduce((found, q) =>
			found || (q.getID() === id && q), null);
	}
}

export default decorate(AggregatedSurveyResults, {with:[model]});
