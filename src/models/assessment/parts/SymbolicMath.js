import {model, COMMON_PREFIX} from '../../Registry';
import Part from '../Part';

export default
@model
class SymbolicMath extends Part {
	static MimeType = COMMON_PREFIX + 'assessment.symbolicmathpart'

	constructor (service, parent, data) {
		super(service, parent, data);
	}
}
