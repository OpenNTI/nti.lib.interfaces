import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry';

import Transcript from './Transcript';

class TranscriptSummary extends Transcript {
	static MimeType = COMMON_PREFIX + 'transcriptsummary';

	getTranscript() {
		return this.fetchLinkParsed('transcript');
	}
}

export default decorate(TranscriptSummary, { with: [model] });
