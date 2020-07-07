import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../../../Registry';
import MultipleChoice from '../MultipleChoice';

class NonGradableMultipleChoice extends MultipleChoice {
	static MimeType = [
		COMMON_PREFIX + 'assessment.nongradablemultiplechoicepart',
		COMMON_PREFIX + 'assessment.nongradablemultiplechoicemultipleanswerpart',
	]

	isNonGradable = true
}

export default decorate(NonGradableMultipleChoice, {with:[model]});
