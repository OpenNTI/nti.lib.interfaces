import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

@model
export default class Response extends Base {
	static MimeType = [
		COMMON_PREFIX + 'assessment.response',
		COMMON_PREFIX + 'assessment.dictresponse',
		COMMON_PREFIX + 'assessment.textresponse',
	]

	constructor (service, parent, data) {
		super(service, parent, data);
	}
}
