import TimeRangeDescription from './TimeRangeDescription';

export default class TranscriptRangeDescription extends TimeRangeDescription {

	constructor (service, parent, data, ...mixins) {
		super(service, parent, data, {Class: 'TranscriptRangeDescription'}, ...mixins);
	}
}
