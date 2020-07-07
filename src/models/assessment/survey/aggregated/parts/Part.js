import {decorate} from '@nti/lib-commons';
import {mixin/*, readonly*/} from '@nti/lib-decorators';

import Base from '../../../../Base';

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

export default decorate(Part, {with: [
	mixin({/*@readonly*/ isAggregated: true}),
]});
