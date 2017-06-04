import {model, COMMON_PREFIX} from '../../../Registry';
import Matching from '../Matching';

@model
export default class NonGradableMatching extends Matching {
	static MimeType = COMMON_PREFIX + 'assessment.nongradablematchingpart'

	constructor (service, parent, data) {
		super(service, parent, data);
	}
}
