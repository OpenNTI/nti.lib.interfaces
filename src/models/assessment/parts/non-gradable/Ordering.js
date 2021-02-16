import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../../Registry';
import Ordering from '../Ordering';

class NonGradableOrdering extends Ordering {
	static MimeType = COMMON_PREFIX + 'assessment.nongradableorderingpart';
	isNonGradable = true;
}

export default decorate(NonGradableOrdering, { with: [model] });
