// import {Parser as parse} from '../../../../../constants.js';
import Registry, { COMMON_PREFIX } from '../../../../Registry.js';

import Base from './MultipleChoice.js';

export default class AggregatedMultipleChoiceMultipleAnswerPart extends Base {
	static MimeType =
		COMMON_PREFIX + 'assessment.aggregatedmultiplechoicemultipleanswerpart';
}

Registry.register(AggregatedMultipleChoiceMultipleAnswerPart);
