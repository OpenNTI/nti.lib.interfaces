import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Part from '../Part.js';

export default class Math extends Part {
	static MimeType = COMMON_PREFIX + 'assessment.mathpart';
}

Registry.register(Math);
