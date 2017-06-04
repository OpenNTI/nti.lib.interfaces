import {model, COMMON_PREFIX} from '../Registry';

import TimeRangeDescription from './TimeRangeDescription';

@model
export default class TranscriptRangeDescription extends TimeRangeDescription {
	static MimeType = COMMON_PREFIX + 'contentrange.transcriptrangedescription'

	constructor (service, parent, data, ...mixins) {
		super(service, parent, data, {Class: 'TranscriptRangeDescription'}, ...mixins);
	}
}
