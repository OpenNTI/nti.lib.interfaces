import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class WordEntry extends Base {
	static MimeType = COMMON_PREFIX + 'naqwordentry';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'wid':     { type: 'string' },
		'content': { type: 'string' }
	};
}

export default decorate(WordEntry, [model]);
