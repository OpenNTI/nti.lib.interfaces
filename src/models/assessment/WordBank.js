import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

class WordBank extends Base {
	static MimeType = COMMON_PREFIX + 'naqwordbank'

	static Fields = {
		...Base.Fields,
		'entries': { type: 'model[]' },
		'unique':  { type: 'boolean' }
	};

	getEntry (id) {
		return this.entries.reduce((found, x) => found || (x.wid === id && x), null);
	}

}
export default decorate(WordBank, {with:[model]});
