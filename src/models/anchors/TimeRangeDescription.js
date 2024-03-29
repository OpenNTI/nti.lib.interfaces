import Registry, { COMMON_PREFIX } from '../Registry.js';

import ContentRangeDescription from './ContentRangeDescription.js';
import TimeContentPointer from './TimeContentPointer.js';

export default class TimeRangeDescription extends ContentRangeDescription {
	static MimeType = COMMON_PREFIX + 'contentrange.timerangedescription';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'seriesId': { type: 'string' },
		'start':    { type: 'model'  },
		'end':      { type: 'model'  },
	};

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

Registry.register(TimeRangeDescription);
