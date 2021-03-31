import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry.js';
import Part from '../Part.js';

class FreeResponse extends Part {
	static MimeType = COMMON_PREFIX + 'assessment.freeresponsepart';
}

export default decorate(FreeResponse, { with: [model] });
