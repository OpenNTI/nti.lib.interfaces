import ContentRangeDescription from './ContentRangeDescription';
import DomContentPointer from './DomContentPointer';

import { Parser as parse } from '../../constants';

export default class DomContentRangeDescription extends ContentRangeDescription {

	constructor (service, parent, data, ...mixins) {
		super(service, parent, data, {Class: 'DomContentRangeDescription'}, ...mixins);
		this.isEmpty = false;
		Object.defineProperty(this, 'isDomContentRangeDescription', {value: true});

		this[parse]('ancestor');
		this[parse]('end');
		this[parse]('start');

		let {start, end, ancestor} = this;

		//make sure contents are acceptable
		if (!start || !end || !ancestor ||
			!this.isDomContentPointer(start) ||
			!this.isDomContentPointer(end) ||
			!this.isDomContentPointer(ancestor))
		{
			// console.error('Invalid contents', arguments);
			throw new Error('Invalid contents');
		}


		Object.assign(this, {start, end, ancestor});
	}


	getStart () { return this.start; }
	getEnd () { return this.end; }
	getAncestor () { return this.ancestor; }


	isDomContentPointer (o) {
		return (o && o instanceof DomContentPointer);
	}
}
