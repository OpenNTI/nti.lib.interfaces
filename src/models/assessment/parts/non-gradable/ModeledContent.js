import {model, COMMON_PREFIX} from '../../../Registry';
import ModeledContent from '../ModeledContent';

export default
@model
class NonGradableModeledContent extends ModeledContent {
	static MimeType = COMMON_PREFIX + 'assessment.nongradablemodeledcontentpart'
	isNonGradable = true
}
