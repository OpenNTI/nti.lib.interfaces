import Base from './Part';
// import {Parser as parse} from '../../../../../constants';

export default class AggregatedMultipleChoicePart extends Base {

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
