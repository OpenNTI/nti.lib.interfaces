import { Parser as parse } from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';

import ContentRangeDescription from './ContentRangeDescription';
import DomContentPointer from './DomContentPointer';

export default
@model
class DomContentRangeDescription extends ContentRangeDescription {
	static MimeType = COMMON_PREFIX + 'contentrange.domcontentrangedescription'

	constructor (service, parent, data) {
		super(service, parent, data);
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
