import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../../Registry.js';
import Matching from '../Matching.js';

class NonGradableMatching extends Matching {
	static MimeType = COMMON_PREFIX + 'assessment.nongradablematchingpart';
	isNonGradable = true;
}

export default decorate(NonGradableMatching, { with: [model] });
