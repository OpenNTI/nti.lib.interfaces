import Base from '../Base';
// import {Parser} from '../../CommonSymbols';

export default class Annotation extends Base {

	constructor (service, parent, data, ...mixins) {
		super(service, parent, data, ...mixins);
	}


	getContainerID () {
		return this.ContainerId;
	}
}
