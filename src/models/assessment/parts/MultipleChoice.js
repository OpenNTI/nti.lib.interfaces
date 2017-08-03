import {ContentKeys} from '../../../mixins/HasContent';
import {model, COMMON_PREFIX} from '../../Registry';
import Part from '../Part';

export default
@model
class MultipleChoice extends Part {
	static MimeType = [
		COMMON_PREFIX + 'assessment.multiplechoicepart',
		COMMON_PREFIX + 'assessment.multiplechoicemultipleanswerpart',
		COMMON_PREFIX + 'assessment.randomizedmultiplechoicepart',
		COMMON_PREFIX + 'assessment.randomizedmultiplechoicemultipleanswerpart',
	]

	constructor (service, parent, data) {
		super(service, parent, data);
	}

	[ContentKeys] () { return super[ContentKeys]().concat(['choices']); }
}
