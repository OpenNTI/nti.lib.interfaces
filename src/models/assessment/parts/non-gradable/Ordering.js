import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../../Registry.js';
import Ordering from '../Ordering.js';

class NonGradableOrdering extends Ordering {
	static MimeType = COMMON_PREFIX + 'assessment.nongradableorderingpart';
	isNonGradable = true;
}

export default decorate(NonGradableOrdering, [model]);
