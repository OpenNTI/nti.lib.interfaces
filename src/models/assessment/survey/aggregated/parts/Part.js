import { decorate } from '@nti/lib-commons';
import { mixin /*, readonly*/ } from '@nti/lib-decorators';

import Base from '../../../../Base.js';

class Part extends Base {
	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Results': { type: 'object[]' },
		'Total':   { type: 'number' },
	}

	getResults(/*questionPart*/) {
		throw new Error('Not Implemented');
	}
}

export default decorate(Part, [mixin({ /*@readonly*/ isAggregated: true })]);
