import Registry, { COMMON_PREFIX } from '../../../Registry.js';
import FreeResponse from '../FreeResponse.js';

export default class NonGradableFreeResponse extends FreeResponse {
	static MimeType = COMMON_PREFIX + 'assessment.nongradablefreeresponsepart';
	isNonGradable = true;
}

Registry.register(NonGradableFreeResponse);
