import Base from '../Model.js';

export class Segment extends Base {
	// prettier-ignore
	static Fields = {
		...super.Fields,
		'title':      { type: 'string'                   },
		'filter_set': { type: 'model', name: 'filterSet' },
	};

	isSegment = true;
}
