import { Parser as parse } from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';

import ContentRangeDescription from './ContentRangeDescription';
import TimeContentPointer from './TimeContentPointer';

export default
@model
class TimeRangeDescription extends ContentRangeDescription {
	static MimeType = COMMON_PREFIX + 'contentrange.timerangedescription'

	constructor (service, parent, data) {
		super(service, parent, data);

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
