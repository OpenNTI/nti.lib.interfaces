// import {Parser as parse} from '../../../../../constants';

import Base from '../../../../Base';

export default class Part extends Base {

	constructor (service, parent, data) {
		super(service, parent, data, {isAggregated: true});

		// console.log(this);
	}


	getResults (/*questionPart*/) {
		console.error('Not Implemented'); //eslint-disable-line no-console
	}
}
