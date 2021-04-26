import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class WordEntry extends Base {
	static MimeType = COMMON_PREFIX + 'naqwordentry';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'wid':     { type: 'string' },
		'content': { type: 'string' }
	};
}

Registry.register(WordEntry);
