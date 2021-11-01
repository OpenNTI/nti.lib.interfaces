import Registry, { COMMON_PREFIX } from '../Registry.js';

import Base from './Base.js';

export default class ContentPointer extends Base {
	static MimeType = COMMON_PREFIX + 'contentrange.contentpointer';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Class': { type: 'string' }
	};
}

Registry.register(ContentPointer);
