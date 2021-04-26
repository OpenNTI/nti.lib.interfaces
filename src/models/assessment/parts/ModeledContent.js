import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Part from '../Part.js';

export default class ModeledContent extends Part {
	static MimeType = COMMON_PREFIX + 'assessment.modeledcontentpart';
}

Registry.register(ModeledContent);
