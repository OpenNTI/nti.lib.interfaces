import { decorate } from '@nti/lib-commons';

// import {Parser as parse} from '../../../../../constants.js';
import { model, COMMON_PREFIX } from '../../../../Registry.js';

import Base from './MultipleChoice.js';

class AggregatedMultipleChoiceMultipleAnswerPart extends Base {
	static MimeType =
		COMMON_PREFIX + 'assessment.aggregatedmultiplechoicemultipleanswerpart';
}

export default decorate(AggregatedMultipleChoiceMultipleAnswerPart, {
	with: [model],
});
