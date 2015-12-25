import Base from '../Base';
import {Parser as parse} from '../../constants';

export default class WordBank extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);
		this[parse]('entries', []);
	}

	getEntry (id) {
		return this.entries.reduce((found, x) => found || (x.wid === id && x), null);
	}

}
