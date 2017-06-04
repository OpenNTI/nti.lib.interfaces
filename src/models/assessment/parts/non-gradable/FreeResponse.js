import {model, COMMON_PREFIX} from '../../../Registry';
import FreeResponse from '../FreeResponse';

@model
export default class NonGradableFreeResponse extends FreeResponse {
	static MimeType = COMMON_PREFIX + 'assessment.nongradablefreeresponsepart'

	constructor (service, parent, data) {
		super(service, parent, data);
	}
}
