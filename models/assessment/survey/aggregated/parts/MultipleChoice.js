import Base from './Part';
// import {Parser as parse} from '../../../../../CommonSymbols';

export default class AggregatedMultipleChoicePart extends Base {

	constructor (service, parent, data) {
		super(service, parent, data);
	}


	getResults (part) {
		const {Results: results, Total: total} = this;
		return part.choices.map((label, index)=> ({
			label,
			index,
			count: results[index] || 0,
			get percent () {
				return ((this.count || 0) / total) * 100;
			}
		}));
	}
}
