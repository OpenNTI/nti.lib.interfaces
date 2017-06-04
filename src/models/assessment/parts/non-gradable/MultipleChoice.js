import {model, COMMON_PREFIX} from '../../../Registry';
import MultipleChoice from '../MultipleChoice';

@model
export default class NonGradableMultipleChoice extends MultipleChoice {
	static MimeType = [
		COMMON_PREFIX + 'assessment.nongradablemultiplechoicepart',
		COMMON_PREFIX + 'assessment.nongradablemultiplechoicemultipleanswerpart',
	]

	constructor (service, parent, data) {
		super(service, parent, data);
	}
}
