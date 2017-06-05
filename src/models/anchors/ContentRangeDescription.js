import {model, COMMON_PREFIX} from '../Registry';

import Base from './Base';

@model
export default class ContentRangeDescription extends Base {
	static MimeType = COMMON_PREFIX + 'contentrange.contentrangedescription'

	constructor (service, parent, data) {
		super(service, parent, data);
	}


	locatorKey () {
		return Symbol.for('locator');
	}


	attachLocator (loc) {
		if (!loc) {
			delete this[this.locatorKey()];
		}
		else {
			this[this.locatorKey()] = loc;
		}
	}


	locator () {
		return this[this.locatorKey()];
	}
}
