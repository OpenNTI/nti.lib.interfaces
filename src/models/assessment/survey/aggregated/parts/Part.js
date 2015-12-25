import Base from '../../../../Base';
// import {Parser as parse} from '../../../../../constants';

export default class Part extends Base {

	constructor (service, parent, data) {
		super(service, parent, data, {isAggregated: true});

		// console.log(this);
	}


	getResults (/*questionPart*/) {
		console.error('Not Implemented');
	}
}
