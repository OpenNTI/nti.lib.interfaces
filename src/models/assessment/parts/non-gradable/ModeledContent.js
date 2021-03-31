import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../../Registry.js';
import ModeledContent from '../ModeledContent.js';

class NonGradableModeledContent extends ModeledContent {
	static MimeType =
		COMMON_PREFIX + 'assessment.nongradablemodeledcontentpart';
	isNonGradable = true;
}

export default decorate(NonGradableModeledContent, { with: [model] });
