import {decorate} from '@nti/lib-commons';

// import {Parser as parse} from '../../../../../constants';
import {model, COMMON_PREFIX} from '../../../../Registry';

import Base from './Part';

class AggregatedMultipleChoicePart extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.aggregatedmultiplechoicepart'

	static Fields = {
		...Base.Fields,
		'Results': { type: '*' },   // can be a map of values
	}

	getResults (part) {
		const {Results: results, Total: total} = this;
		return part.choices.map((label, index)=> ({
			labelPrefix: String.fromCharCode(65 + index) + '.',
			label,
			series: [{
				//label: 'Chosen',
				count: results[index] || 0,
				total,
				get percent () {
					return ((this.count || 0) / total) * 100;
				}
			}]
		}));
	}
}

export default decorate(AggregatedMultipleChoicePart, {with:[model]});
