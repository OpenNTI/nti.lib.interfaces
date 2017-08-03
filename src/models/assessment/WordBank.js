import {Parser as parse} from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class WordBank extends Base {
	static MimeType = COMMON_PREFIX + 'naqwordbank'

	constructor (service, parent, data) {
		super(service, parent, data);
		this[parse]('entries', []);
	}

	getEntry (id) {
		return this.entries.reduce((found, x) => found || (x.wid === id && x), null);
	}

}
