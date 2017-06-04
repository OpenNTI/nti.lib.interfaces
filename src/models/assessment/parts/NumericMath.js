import {model, COMMON_PREFIX} from '../../Registry';
import Part from '../Part';

@model
export default class NumericMath extends Part {
	static MimeType = COMMON_PREFIX + 'assessment.assessment.numericmathpart'

	constructor (service, parent, data) {
		super(service, parent, data);
	}
}
