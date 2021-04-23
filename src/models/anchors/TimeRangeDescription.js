import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import ContentRangeDescription from './ContentRangeDescription.js';
import TimeContentPointer from './TimeContentPointer.js';

class TimeRangeDescription extends ContentRangeDescription {
	static MimeType = COMMON_PREFIX + 'contentrange.timerangedescription';

	// prettier-ignore
	static Fields = {
		...ContentRangeDescription.Fields,
		'seriesId': { type: 'string' },
		'start':    { type: 'model'  },
		'end':      { type: 'model'  },
	}

	isTimeRange = true;
	isEmpty = false;

	constructor(service, parent, data) {
		super(service, parent, data);

		if (!this.isTimeContentPointer(this.start)) {
			throw new Error('Invalid contents');
		}
	}

	getSeriesId() {
		return this.seriesId;
	}
	getStart() {
		return this.start;
	}
	getEnd() {
		return this.end;
	}

	isTimeContentPointer(o) {
		return Boolean(o && o instanceof TimeContentPointer);
	}
}

export default decorate(TimeRangeDescription, [model]);
