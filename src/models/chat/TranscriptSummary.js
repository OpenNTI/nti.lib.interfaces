import Registry, { COMMON_PREFIX } from '../Registry.js';

import Transcript from './Transcript.js';

export default class TranscriptSummary extends Transcript {
	static MimeType = COMMON_PREFIX + 'transcriptsummary';

	getTranscript() {
		return this.fetchLink('transcript');
	}
}

Registry.register(TranscriptSummary);
