import {model, COMMON_PREFIX} from '../Registry';

import Base from './Base';

export default
@model
class ContentRangeDescription extends Base {
	static MimeType = COMMON_PREFIX + 'contentrange.contentrangedescription'

	static Fields = {
		...Base.Fields,
		'Class': { type: 'string' }
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
