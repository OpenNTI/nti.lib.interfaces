import {model, COMMON_PREFIX} from '../Registry';

import ContentRangeDescription from './ContentRangeDescription';
import TimeContentPointer from './TimeContentPointer';

export default
@model
class TimeRangeDescription extends ContentRangeDescription {
	static MimeType = COMMON_PREFIX + 'contentrange.timerangedescription'

	static Fields = {
		...ContentRangeDescription.Fields,
		'seriesId': { type: 'string' },
		'start':    { type: 'model'  },
		'end':      { type: 'model'  },
	}

	isTimeRange = true
	isEmpty = false

	constructor (service, parent, data) {
		super(service, parent, data);

		if (!this.isTimeContentPointer(this.start)) {
			throw new Error('Invalid contents');
		}
	}


	getSeriesId () { return this.seriesId; }
	getStart () { return this.start; }
	getEnd () { return this.end; }


	isTimeContentPointer (o) {
		return Boolean(o && o instanceof TimeContentPointer);
	}
}
