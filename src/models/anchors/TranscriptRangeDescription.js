import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import TimeRangeDescription from './TimeRangeDescription.js';

class TranscriptRangeDescription extends TimeRangeDescription {
	static MimeType = COMMON_PREFIX + 'contentrange.transcriptrangedescription';
}

export default decorate(TranscriptRangeDescription, [model]);
