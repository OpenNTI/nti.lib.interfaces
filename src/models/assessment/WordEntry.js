import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

class WordEntry extends Base {
	static MimeType = COMMON_PREFIX + 'naqwordentry'

	static Fields = {
		...Base.Fields,
		'wid':     { type: 'string' },
		'content': { type: 'string' }
	};
}

export default decorate(WordEntry, {with:[model]});
