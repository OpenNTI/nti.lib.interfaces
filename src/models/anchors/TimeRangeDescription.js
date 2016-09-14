import ContentRangeDescription from './ContentRangeDescription';
import TimeContentPointer from './TimeContentPointer';

import { Parser as parse } from '../../constants';

export default class TimeRangeDescription extends ContentRangeDescription {

	constructor (service, parent, data, ...mixins) {
		super(service, parent, data, {Class: 'TimeRangeDescription'}, ...mixins);

		this[parse]('start');
		this[parse]('end');

		Object.defineProperty(this, 'isTimeRange', {value: true});

		this.isEmpty = false;

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
