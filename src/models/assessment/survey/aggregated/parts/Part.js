import Base from '../../../../Base.js';

export default class Part extends Base {
	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Results': { type: 'object[]' },
		'Total':   { type: 'number' },
	};

	isAggregated = true;

	getResults(/*questionPart*/) {
		throw new Error('Not Implemented');
	}
}
