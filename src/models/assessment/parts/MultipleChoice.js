import Part from '../Part';
import {ContentKeys} from '../../mixins/HasContent';

export default class MultipleChoice extends Part {
	constructor (service, parent, data) {
		super(service, parent, data);
	}

	[ContentKeys] () { return super[ContentKeys]().concat(['choices']); }
}
