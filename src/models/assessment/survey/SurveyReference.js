import {mixin} from '@nti/lib-decorators';

import Completable from '../../../mixins/Completable';
import {ASSESSMENT_HISTORY_LINK} from '../../../constants';
import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
@mixin(Completable)
class SurveyReference extends Base {
	static MimeType = COMMON_PREFIX + 'surveyref'

	static Fields = {
		...Base.Fields,
		'question-count': { type: 'number?' },
		'label':          { type: 'string'  },
		'submissions':    { type: 'number'  },
		'Target-NTIID':   { type: 'string'  }
	}


	get isSubmitted () {
		return this.hasLink(ASSESSMENT_HISTORY_LINK);
	}

	getQuestionCount () {
		return this['question-count'] || 0;
	}
}
