import Part from '../Part';
import {ContentKeys} from '../../../mixins/HasContent';

export default class Matching extends Part {
	constructor (service, parent, data) {
		super(service, parent, data);
	}

	[ContentKeys] () { return super[ContentKeys]().concat(['values', 'labels']); }

	isAnswered (partValue) {
		let maybe = !!partValue;
		let {length} = this.values;

		for(let i = 0; maybe && i < length; i++) {
			//all values have to be non-nully
			maybe = maybe && partValue[i] != null;
		}

		return maybe;
	}
}
