import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';

import ContentRangeDescription from './ContentRangeDescription';
import DomContentPointer from './DomContentPointer';

class DomContentRangeDescription extends ContentRangeDescription {
	static MimeType = COMMON_PREFIX + 'contentrange.domcontentrangedescription'

	static Fields = {
		...ContentRangeDescription.Fields,
		'ancestor': { type: 'model' },
		'end':      { type: 'model' },
		'start':    { type: 'model' },
	}

	isDomContentRangeDescription = true
	isEmpty = false

	constructor (service, parent, data) {
		super(service, parent, data);

		const {start, end, ancestor} = this;

		//make sure contents are acceptable
		if (!start || !end || !ancestor ||
			!this.isDomContentPointer(start) ||
			!this.isDomContentPointer(end) ||
			!this.isDomContentPointer(ancestor))
		{
			// console.error('Invalid contents', arguments);
			throw new Error('Invalid contents');
		}
	}


	getStart () { return this.start; }
	getEnd () { return this.end; }
	getAncestor () { return this.ancestor; }


	isDomContentPointer (o) {
		return (o && o instanceof DomContentPointer);
	}
}

export default decorate(DomContentRangeDescription, {with: [model]});
