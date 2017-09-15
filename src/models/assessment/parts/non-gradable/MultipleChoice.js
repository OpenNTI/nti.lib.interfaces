import {model, COMMON_PREFIX} from '../../../Registry';
import MultipleChoice from '../MultipleChoice';

export default
@model
class NonGradableMultipleChoice extends MultipleChoice {
	static MimeType = [
		COMMON_PREFIX + 'assessment.nongradablemultiplechoicepart',
		COMMON_PREFIX + 'assessment.nongradablemultiplechoicemultipleanswerpart',
	]

	isNonGradable = true
}
