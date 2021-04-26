import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Part from '../Part.js';

export default class FreeResponse extends Part {
	static MimeType = COMMON_PREFIX + 'assessment.freeresponsepart';
}

Registry.register(FreeResponse);
