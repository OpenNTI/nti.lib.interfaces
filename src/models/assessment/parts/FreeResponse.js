import {model, COMMON_PREFIX} from '../../Registry';
import Part from '../Part';

@model
export default class FreeResponse extends Part {
	static MimeType = COMMON_PREFIX + 'assessment.freeresponsepart'

	constructor (service, parent, data) {
		super(service, parent, data);
	}
}