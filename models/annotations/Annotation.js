import Base from '../Base';
// import {Parser} from '../../CommonSymbols';

export default class Annotation extends Base {

	constructor (service, parent, data) {
		super(service, parent, data);
	}


	getContainerID () {
		return this.ContainerId;
	}
}
