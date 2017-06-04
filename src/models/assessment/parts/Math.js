import {model, COMMON_PREFIX} from '../../Registry';
import Part from '../Part';

@model
export default class Math extends Part {
	static MimeType = COMMON_PREFIX + 'assessment.mathpart'

	constructor (service, parent, data) {
		super(service, parent, data);
	}
}
