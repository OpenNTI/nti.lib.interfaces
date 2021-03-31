import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import Base from './Base.js';

class ContentPointer extends Base {
	static MimeType = COMMON_PREFIX + 'contentrange.contentpointer';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'Class': { type: 'string' }
	}
}

export default decorate(ContentPointer, { with: [model] });
