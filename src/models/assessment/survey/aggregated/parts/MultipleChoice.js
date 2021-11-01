// import {Parser as parse} from '../../../../../constants.js';
import Registry, { COMMON_PREFIX } from '../../../../Registry.js';

import Base from './Part.js';

export default class AggregatedMultipleChoicePart extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.aggregatedmultiplechoicepart';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Results': { type: '*' },   // can be a map of values
	};

	getResults(part) {
		const { Results: results, Total: total } = this;
		return part.choices.map((label, index) => ({
			labelPrefix: String.fromCharCode(65 + index) + '.',
			label,
			series: [
				{
					//label: 'Chosen',
					count: results[index] || 0,
					total,
					get percent() {
						return ((this.count || 0) / total) * 100;
					},
				},
			],
		}));
	}
}

Registry.register(AggregatedMultipleChoicePart);
