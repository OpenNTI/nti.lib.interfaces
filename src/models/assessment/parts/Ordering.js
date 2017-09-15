import {model, COMMON_PREFIX} from '../../Registry';
import Part from '../Part';

export default
@model
class Ordering extends Part {
	static MimeType = COMMON_PREFIX + 'assessment.orderingpart'

	static Fields = {
		...Part.Fields,
		'labels': { type: 'string[]', content: true },
		'values': { type: 'string[]', content: true },
	}

	isAnswered () { return true; }

	getInitialValue () {
		return Object.assign({}, (this.labels || []).map((_, i) => i));
	}
}
