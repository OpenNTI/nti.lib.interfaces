import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry';

import TimeRangeDescription from './TimeRangeDescription';

class TranscriptRangeDescription extends TimeRangeDescription {
	static MimeType = COMMON_PREFIX + 'contentrange.transcriptrangedescription';
}

export default decorate(TranscriptRangeDescription, { with: [model] });
