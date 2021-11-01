import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Part from '../Part.js';

export default class MultipleChoice extends Part {
	static MimeType = [
		COMMON_PREFIX + 'assessment.multiplechoicepart',
		COMMON_PREFIX + 'assessment.multiplechoicemultipleanswerpart',
		COMMON_PREFIX + 'assessment.randomizedmultiplechoicepart',
		COMMON_PREFIX + 'assessment.randomizedmultiplechoicemultipleanswerpart',
	];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'choices': { type: 'string[]', content: true },
	};
}

Registry.register(MultipleChoice);
