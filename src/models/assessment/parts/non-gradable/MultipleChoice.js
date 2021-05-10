import Registry, { COMMON_PREFIX } from '../../../Registry.js';
import MultipleChoice from '../MultipleChoice.js';

export default class NonGradableMultipleChoice extends MultipleChoice {
	static MimeType = [
		COMMON_PREFIX + 'assessment.nongradablemultiplechoicepart',
		COMMON_PREFIX +
			'assessment.nongradablemultiplechoicemultipleanswerpart',
	];

	isNonGradable = true;
}

Registry.register(NonGradableMultipleChoice);
