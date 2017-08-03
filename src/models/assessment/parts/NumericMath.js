import {model, COMMON_PREFIX} from '../../Registry';
import Part from '../Part';

export default
@model
class NumericMath extends Part {
	static MimeType = COMMON_PREFIX + 'assessment.numericmathpart'

	constructor (service, parent, data) {
		super(service, parent, data);
	}
}
