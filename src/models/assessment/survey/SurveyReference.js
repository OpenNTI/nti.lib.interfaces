import {decorate} from '@nti/lib-commons';
import {mixin} from '@nti/lib-decorators';

import Completable from '../../../mixins/Completable';
import {ASSESSMENT_HISTORY_LINK} from '../../../constants';
import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

class SurveyReference extends Base {
	static MimeType = COMMON_PREFIX + 'surveyref'

	static Fields = {
		...Base.Fields,
		'isClosed':                              { type: 'boolean' },
		'question-count':                        { type: 'number?' },
		'label':                                 { type: 'string'  },
		'submissions':                           { type: 'number'  },
		'title':                                 { type: 'string'  },
		'Target-NTIID':                          { type: 'string'  },
		'TargetAvailableForSubmissionBeginning': { type: 'date'    },
		'TargetAvailableForSubmissionEnding':    { type: 'date'    },
		'TargetPublishState':                    { type: 'string'  }
	}


	get isSubmitted () {
		return this.hasLink(ASSESSMENT_HISTORY_LINK);
	}

	getQuestionCount () {
		return this['question-count'] || 0;
	}

	get target () {
		return this['Target-NTIID'];
	}

	isTargetPublished () {
		return this.TargetPublishState === 'DefaultPublished';
	}

	getTargetAssignedDate () {
		return this.getTargetAvailableForSubmissionBeginning();
	}

	getTargetDueDate () {
		return this.getTargetAvailableForSubmissionEnding();
	}
}

export default decorate(SurveyReference, {with: [
	model,
	mixin(Completable),
]});
