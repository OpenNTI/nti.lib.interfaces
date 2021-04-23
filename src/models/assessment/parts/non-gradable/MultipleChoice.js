import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../../Registry.js';
import MultipleChoice from '../MultipleChoice.js';

class NonGradableMultipleChoice extends MultipleChoice {
	static MimeType = [
		COMMON_PREFIX + 'assessment.nongradablemultiplechoicepart',
		COMMON_PREFIX +
			'assessment.nongradablemultiplechoicemultipleanswerpart',
	];

	isNonGradable = true;
}

export default decorate(NonGradableMultipleChoice, [model]);
