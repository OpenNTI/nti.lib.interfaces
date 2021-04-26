// import {Parser as parse} from '../../../../../constants.js';
import Registry, { COMMON_PREFIX } from '../../../../Registry.js';

import Base from './Ordering.js';

export default class AggregatedMatchingPart extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.aggregatedmatchingpart';

	getResults(part) {
		let results = super.getResults(part);
		let pivotData = [];

		for (let value of part.values) {
			let series = results
				.filter(x => value in x.matchedToValues)
				.map(x => ({
					label: x.label,
					labelIndex: x.labelIndex,
					...x.matchedToValues[value],
				}));

			pivotData.push({
				label: value,
				series,
			});
		}

		// console.log('Matching pivots the Ordering Data: ', results, '->', pivotData);
		return pivotData;
	}
}

Registry.register(AggregatedMatchingPart);
