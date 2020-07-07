import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from './Registry';
import Base from './Base';

class Change extends Base {
	static MimeType = COMMON_PREFIX + 'change'

	static Fields = {
		...Base.Fields,
		'Item': { type: 'model' }
	}

}

export default decorate(Change, { with: [model]});
