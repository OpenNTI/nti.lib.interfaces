import {mixin/*, readonly*/} from 'nti-lib-decorators';

import Base from '../../../../Base';

export default
@mixin({/*@readonly*/ isAggregated: true})
class Part extends Base {

	static Fields = {
		...Base.Fields,
		'Results': { type: 'object[]' },
		'Total':   { type: 'number' },
	}


	getResults (/*questionPart*/) {
		throw new Error('Not Implemented');
	}
}
