import {ContentKeys} from '../../../mixins/HasContent';
import {model, COMMON_PREFIX} from '../../Registry';
import Part from '../Part';

export default
@model
class Ordering extends Part {
	static MimeType = COMMON_PREFIX + 'assessment.orderingpart'

	constructor (service, parent, data) {
		super(service, parent, data);
	}

	[ContentKeys] () { return super[ContentKeys]().concat(['values', 'labels']); }

	isAnswered () { return true; }

	getInitialValue () {
		return Object.assign({}, (this.labels || []).map((_, i) => i));
	}
}
