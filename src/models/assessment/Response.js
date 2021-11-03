import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

export default class Response extends Base {
	static MimeType = [
		COMMON_PREFIX + 'assessment.response',
		COMMON_PREFIX + 'assessment.dictresponse',
		COMMON_PREFIX + 'assessment.textresponse',
	];
}

Registry.register(Response);
