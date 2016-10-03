import Part from '../Part';
import {ContentKeys} from '../../mixins/HasContent';

export default class Ordering extends Part {
	constructor (service, parent, data) {
		super(service, parent, data);
	}

	[ContentKeys] () { return super[ContentKeys]().concat(['values', 'labels']); }

	isAnswered () { return true; }

	getInitialValue () {
		return Object.assign({}, (this.labels || []).map((_, i) => i));
	}
}
