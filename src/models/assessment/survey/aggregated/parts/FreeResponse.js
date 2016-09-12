import Base from './Part';
// import {Parser as parse} from '../../../../../constants';

export default class AggregatedFreeResponsePart extends Base {

	constructor (service, parent, data) {
		super(service, parent, data);
	}


	getResults () {
		return this.Results;
	}
}
