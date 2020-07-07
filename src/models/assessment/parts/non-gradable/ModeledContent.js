import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../../../Registry';
import ModeledContent from '../ModeledContent';

class NonGradableModeledContent extends ModeledContent {
	static MimeType = COMMON_PREFIX + 'assessment.nongradablemodeledcontentpart'
	isNonGradable = true
}

export default decorate(NonGradableModeledContent, {with:[model]});
