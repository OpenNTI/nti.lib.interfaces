import Registry, { COMMON_PREFIX } from '../Registry.js';

import TimeRangeDescription from './TimeRangeDescription.js';

export default class TranscriptRangeDescription extends TimeRangeDescription {
	static MimeType = COMMON_PREFIX + 'contentrange.transcriptrangedescription';
}

Registry.register(TranscriptRangeDescription);
