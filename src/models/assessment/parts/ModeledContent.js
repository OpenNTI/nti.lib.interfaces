import {model, COMMON_PREFIX} from '../../Registry';
import Part from '../Part';

@model
export default class ModeledContent extends Part {
	static MimeType = COMMON_PREFIX + 'assessment.modeledcontentpart'

	constructor (service, parent, data) {
		super(service, parent, data);
	}
}
