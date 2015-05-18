import ContentRangeDescription from './ContentRangeDescription';

import { Parser as parse } from '../../CommonSymbols';

export default class TimeRangeDescription extends ContentRangeDescription {

	constructor (service, parent, data) {
		super(service, parent, data);

		this[parse]('start');
		this[parse]('end');

		this.isTimeRange = true;
		this.isEmpty = false;

		if (!this.isTimeContentPointer(this.start)) {
			console.error('Missing or invalid time start', arguments);
			throw new Error('Invalid contents');
		}

	}


	getSeriesId() { return this.seriesId; }
	getStart() { return this.start; }
	getEnd() { return this.end; }


	isTimeContentPointer (o) {
		let pointer = this.getModel('contentrange.timecontentpointer');
		return Boolean(o && o instanceof pointer);
	}
}
