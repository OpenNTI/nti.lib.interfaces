import {model, COMMON_PREFIX} from '../../Registry';
import Part from '../Part';

export default
@model
class FreeResponse extends Part {
	static MimeType = COMMON_PREFIX + 'assessment.freeresponsepart'
}
