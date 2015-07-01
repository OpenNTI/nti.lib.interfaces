import Base from '../Base';

import Likable from '../mixins/Likable';

import {Service} from '../../CommonSymbols';

export default class Annotation extends Base {

	constructor (service, parent, data, ...mixins) {
		super(service, parent, data, Likable, ...mixins);
	}


	getContainerID () {
		return this.ContainerId;
	}


	getContextData () {
		return this[Service].getParsedObject(this.getContainerID());
	}
}
