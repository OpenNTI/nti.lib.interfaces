import {model, COMMON_PREFIX} from '../../../Registry';
import ModeledContent from '../ModeledContent';

@model
export default class NonGradableModeledContent extends ModeledContent {
	static MimeType = COMMON_PREFIX + 'assessment.nongradablemodeledcontentpart'

	constructor (service, parent, data) {
		super(service, parent, data);
	}
}
