import {model, COMMON_PREFIX} from '../Registry';

import Transcript from './Transcript';

@model
export default class TranscriptSummary extends Transcript {
	static MimeType = COMMON_PREFIX + 'transcriptsummary'

	constructor (service, parent, data) {
		super(service, parent, data);
	}

	getTranscript () {
		return this.fetchLinkParsed('transcript');
	}
}
