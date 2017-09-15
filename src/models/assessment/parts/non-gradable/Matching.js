import {model, COMMON_PREFIX} from '../../../Registry';
import Matching from '../Matching';

export default
@model
class NonGradableMatching extends Matching {
	static MimeType = COMMON_PREFIX + 'assessment.nongradablematchingpart'
	isNonGradable = true
}
