import {model, COMMON_PREFIX} from '../../../Registry';
import Ordering from '../Ordering';

export default
@model
class NonGradableOrdering extends Ordering {
	static MimeType = COMMON_PREFIX + 'assessment.nongradableorderingpart'

	constructor (service, parent, data) {
		super(service, parent, data);
	}
}
