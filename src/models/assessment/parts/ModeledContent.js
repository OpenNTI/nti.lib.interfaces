import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry.js';
import Part from '../Part.js';

class ModeledContent extends Part {
	static MimeType = COMMON_PREFIX + 'assessment.modeledcontentpart';
}

export default decorate(ModeledContent, { with: [model] });
