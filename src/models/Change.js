import Base from './Base';
import {Parser} from '../constants';

export default class Change extends Base {

	constructor (service, parent, data) {
		super(service, parent, data);
		this.Item = this[Parser](data.Item);
	}

}
