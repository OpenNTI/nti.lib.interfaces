import Registry, { COMMON_PREFIX } from '../../../Registry.js';
import Ordering from '../Ordering.js';

export default class NonGradableOrdering extends Ordering {
	static MimeType = COMMON_PREFIX + 'assessment.nongradableorderingpart';
	isNonGradable = true;
}

Registry.register(NonGradableOrdering);
