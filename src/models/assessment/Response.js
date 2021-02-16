import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry';
import Base from '../Base';

class Response extends Base {
	static MimeType = [
		COMMON_PREFIX + 'assessment.response',
		COMMON_PREFIX + 'assessment.dictresponse',
		COMMON_PREFIX + 'assessment.textresponse',
	];
}

export default decorate(Response, { with: [model] });
