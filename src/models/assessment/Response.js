import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class Response extends Base {
	static MimeType = [
		COMMON_PREFIX + 'assessment.response',
		COMMON_PREFIX + 'assessment.dictresponse',
		COMMON_PREFIX + 'assessment.textresponse',
	];
}

export default decorate(Response, [model]);
