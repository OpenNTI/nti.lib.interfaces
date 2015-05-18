import ContentRangeDescription from './ContentRangeDescription';

import { Parser as parse } from '../../CommonSymbols';

export default class DomContentRangeDescription extends ContentRangeDescription {

	constructor (service, parent, data) {
		super(service, parent, data);
		this.isEmpty = false;
		this.isDomContentRangeDescription = true;

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
			console.error('Invalid contents', arguments);
			throw new Error('Invalid contents');
		}


		Object.assign(this, {start, end, ancestor});
	}


	getStart () { return this.start; }
	getEnd () { return this.end; }
	getAncestor () { return this.ancestor; }


	isDomContentPointer (o) {
		let pointer = this.getModel('contentrange.domcontentpointer');
		return (o && o instanceof pointer);
	}
}
