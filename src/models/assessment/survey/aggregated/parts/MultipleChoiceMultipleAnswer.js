import {decorate} from '@nti/lib-commons';

// import {Parser as parse} from '../../../../../constants';
import {model, COMMON_PREFIX} from '../../../../Registry';

import Base from './MultipleChoice';

class AggregatedMultipleChoiceMultipleAnswerPart extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.aggregatedmultiplechoicemultipleanswerpart'
}

export default decorate(AggregatedMultipleChoiceMultipleAnswerPart, {with:[model]});
