// import {Parser as parse} from '../../../../../constants';
import {model, COMMON_PREFIX} from '../../../../Registry';

import Base from './Part';

@model
export default class AggregatedMultipleChoicePart extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.aggregatedmultiplechoicepart'

	constructor (service, parent, data) {
		super(service, parent, data);
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
