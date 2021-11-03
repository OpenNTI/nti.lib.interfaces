import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

export default class WordBank extends Base {
	static MimeType = COMMON_PREFIX + 'naqwordbank';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'entries': { type: 'model[]' },
		'unique':  { type: 'boolean' }
	};

	getEntry(id) {
		return this.entries.reduce(
			(found, x) => found || (x.wid === id && x),
			null
		);
	}
}
Registry.register(WordBank);
