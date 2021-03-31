import { decorate } from '@nti/lib-commons';

// import {Parser as parse} from '../../../../../constants.js';
import { model, COMMON_PREFIX } from '../../../../Registry.js';

import Base from './Part.js';

class AggregatedMultipleChoicePart extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.aggregatedmultiplechoicepart';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'Results': { type: '*' },   // can be a map of values
	}

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

export default decorate(AggregatedMultipleChoicePart, { with: [model] });
