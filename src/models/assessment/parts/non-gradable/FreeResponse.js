import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../../Registry.js';
import FreeResponse from '../FreeResponse.js';

class NonGradableFreeResponse extends FreeResponse {
	static MimeType = COMMON_PREFIX + 'assessment.nongradablefreeresponsepart';
	isNonGradable = true;
}

export default decorate(NonGradableFreeResponse, [model]);
