import {model, COMMON_PREFIX} from '../Registry';

import TimeRangeDescription from './TimeRangeDescription';

export default
@model
class TranscriptRangeDescription extends TimeRangeDescription {
	static MimeType = COMMON_PREFIX + 'contentrange.transcriptrangedescription'

	constructor (service, parent, data) {
		super(service, parent, data);
	}
}
