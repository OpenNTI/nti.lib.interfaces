import Registry, { COMMON_PREFIX } from '../../../Registry.js';
import Matching from '../Matching.js';

export default class NonGradableMatching extends Matching {
	static MimeType = COMMON_PREFIX + 'assessment.nongradablematchingpart';
	isNonGradable = true;
}

Registry.register(NonGradableMatching);
