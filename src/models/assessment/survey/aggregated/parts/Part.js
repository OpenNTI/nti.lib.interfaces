import {mixin, readonly} from 'nti-lib-decorators';

// import {Parser as parse} from '../../../../../constants';

import Base from '../../../../Base';

export default
@mixin({@readonly isAggregated: true})
class Part extends Base {

	constructor (service, parent, data) {
		super(service, parent, data);

		// console.log(this);
	}


	getResults (/*questionPart*/) {
		console.error('Not Implemented'); //eslint-disable-line no-console
	}
}
