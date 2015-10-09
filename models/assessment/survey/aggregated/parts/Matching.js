import Base from './Ordering';
// import {Parser as parse} from '../../../../../CommonSymbols';

export default class AggregatedMatchingPart extends Base {

	constructor (service, parent, data) {
		super(service, parent, data);
	}


	getResults (part) {
		let results = super.getResults(part);
		let pivotData = [];

		for (let value of part.values) {

			let series = results
				.filter(x => value in x.matchedToValues)
				.map(x => Object.assign({ label: x.label, labelIndex: x.labelIndex }, x.matchedToValues[value]));


			pivotData.push({
				label: value,
				series
			});
		}

		console.log('Matching pivots the Ordering Data: ', results, '->', pivotData);
		return pivotData;
	}
}
