import {Parser as parse} from '../constants';

import Base from './Base';

export default class Batch extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);

		this[parse]('Items');
	}
}
