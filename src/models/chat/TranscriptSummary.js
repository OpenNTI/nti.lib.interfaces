import {model, COMMON_PREFIX} from '../Registry';

import Transcript from './Transcript';

export default
@model
class TranscriptSummary extends Transcript {
	static MimeType = COMMON_PREFIX + 'transcriptsummary'

	constructor (service, parent, data) {
		super(service, parent, data);
	}

	getTranscript () {
		return this.fetchLinkParsed('transcript');
	}
}
