import Completable from '../../../mixins/Completable.js';
import { ASSESSMENT_HISTORY_LINK } from '../../../constants.js';
import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';

export default class SurveyReference extends Completable(Base) {
	static MimeType = COMMON_PREFIX + 'surveyref';

	// prettier-ignore
	static Fields = {
		...super.Fields,
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

	get isSubmitted() {
		return this.hasLink(ASSESSMENT_HISTORY_LINK);
	}

	getQuestionCount() {
		return this['question-count'] || 0;
	}

	get target() {
		return this['Target-NTIID'];
	}

	isTargetPublished() {
		return this.TargetPublishState === 'DefaultPublished';
	}

	getTargetAssignedDate() {
		return this.getTargetAvailableForSubmissionBeginning();
	}

	getTargetDueDate() {
		return this.getTargetAvailableForSubmissionEnding();
	}
}

Registry.register(SurveyReference);
