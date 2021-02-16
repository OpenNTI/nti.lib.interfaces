import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry';
import Part from '../Part';

class ModeledContent extends Part {
	static MimeType = COMMON_PREFIX + 'assessment.modeledcontentpart';
}

export default decorate(ModeledContent, { with: [model] });
