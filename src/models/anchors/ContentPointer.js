import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';

import Base from './Base';

class ContentPointer extends Base {
	static MimeType = COMMON_PREFIX + 'contentrange.contentpointer'

	static Fields = {
		...Base.Fields,
		'Class': { type: 'string' }
	}
}

export default decorate(ContentPointer, { with: [model]});
