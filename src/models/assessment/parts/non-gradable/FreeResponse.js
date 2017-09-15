import {model, COMMON_PREFIX} from '../../../Registry';
import FreeResponse from '../FreeResponse';

export default
@model
class NonGradableFreeResponse extends FreeResponse {
	static MimeType = COMMON_PREFIX + 'assessment.nongradablefreeresponsepart'
	isNonGradable = true
}
