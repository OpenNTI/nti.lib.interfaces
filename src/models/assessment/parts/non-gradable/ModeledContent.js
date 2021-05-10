import Registry, { COMMON_PREFIX } from '../../../Registry.js';
import ModeledContent from '../ModeledContent.js';

export default class NonGradableModeledContent extends ModeledContent {
	static MimeType =
		COMMON_PREFIX + 'assessment.nongradablemodeledcontentpart';
	isNonGradable = true;
}

Registry.register(NonGradableModeledContent);
