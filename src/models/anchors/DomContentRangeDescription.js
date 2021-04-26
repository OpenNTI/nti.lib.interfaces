import Registry, { COMMON_PREFIX } from '../Registry.js';

import ContentRangeDescription from './ContentRangeDescription.js';
import DomContentPointer from './DomContentPointer.js';

export default class DomContentRangeDescription extends ContentRangeDescription {
	static MimeType = COMMON_PREFIX + 'contentrange.domcontentrangedescription';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'ancestor': { type: 'model' },
		'end':      { type: 'model' },
		'start':    { type: 'model' },
	}

	isDomContentRangeDescription = true;
	isEmpty = false;

	constructor(service, parent, data) {
		super(service, parent, data);

		const { start, end, ancestor } = this;

		//make sure contents are acceptable
		if (
			!start ||
			!end ||
			!ancestor ||
			!this.isDomContentPointer(start) ||
			!this.isDomContentPointer(end) ||
			!this.isDomContentPointer(ancestor)
		) {
			// console.error('Invalid contents', arguments);
			throw new Error('Invalid contents');
		}
	}

	getStart() {
		return this.start;
	}
	getEnd() {
		return this.end;
	}
	getAncestor() {
		return this.ancestor;
	}

	isDomContentPointer(o) {
		return o && o instanceof DomContentPointer;
	}
}

Registry.register(DomContentRangeDescription);
