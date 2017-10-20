import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
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
