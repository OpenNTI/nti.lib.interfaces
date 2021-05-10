import Registry, { COMMON_PREFIX } from '../Registry.js';

import Purchasable from './Purchasable.js';

export default class PurchasableCourseChoiceBundle extends Purchasable {
	static MimeType = COMMON_PREFIX + 'store.purchasablecoursechoicebundle';
}

Registry.register(PurchasableCourseChoiceBundle);
