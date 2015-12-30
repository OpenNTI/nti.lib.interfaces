import Base from './Part';
// import {Parser as parse} from '../../../../../constants';

export default class AggregatedOrderingPart extends Base {

	constructor (service, parent, data) {
		super(service, parent, data);
	}


	getResults (part) {
		const ix = x => part.values.indexOf(x[0]);
		const byValuesOrder = (a, b) => ix(a) - ix(b);
		const {Results: results, Total: total} = this;
		let mapped = [];

		// console.groupCollapsed('Ordering');

		for (let [labelIndex, label] of Object.entries(part.labels)) {

			let mapping = Object.assign({}, results[labelIndex] || {});

			for (let valueIndex of Object.keys(mapping)) {
				let value = part.values[valueIndex];
				if (value) {
					mapping[value] = {
						count: mapping[valueIndex],
						total,
						get percent () {
							return ((this.count || 0) / total) * 100;
						}
					};
				}
				delete mapping[valueIndex];
			}

			mapped.push({labelIndex, label, matchedToValues: mapping});
			// console.log(label, '-> ', mapping);
		}

		// console.log('Value Order: ', part.values);

		// console.groupEnd('Ordering');
		return mapped.map(item => {
			const remap = Object.assign({series: []}, item);
			const {matchedToValues: map} = item;

			const entries = Object.entries(map).sort(byValuesOrder);

			for (let [label, value] of entries) {
				remap.series.push(Object.assign({label}, value));
			}

			return remap;
		});
	}
}