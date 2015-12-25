import Transcript from './Transcript';

export default class TranscriptSummary extends Transcript {
	constructor (service, parent, data) {
		super(service, parent, data);
	}

	getTranscript () {
		return this.fetchLinkParsed('transcript');
	}
}
