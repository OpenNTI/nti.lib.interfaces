import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import Base from './Base.js';

class ContentRangeDescription extends Base {
	static MimeType = COMMON_PREFIX + 'contentrange.contentrangedescription';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Class': { type: 'string' }
	}

	locatorKey() {
		return Symbol.for('locator');
	}

	attachLocator(loc) {
		if (!loc) {
			delete this[this.locatorKey()];
		} else {
			this[this.locatorKey()] = loc;
		}
	}

	locator() {
		return this[this.locatorKey()];
	}
}

export default decorate(ContentRangeDescription, [model]);
