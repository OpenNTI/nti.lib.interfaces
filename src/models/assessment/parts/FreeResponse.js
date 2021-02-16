import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry';
import Part from '../Part';

class FreeResponse extends Part {
	static MimeType = COMMON_PREFIX + 'assessment.freeresponsepart';
}

export default decorate(FreeResponse, { with: [model] });
