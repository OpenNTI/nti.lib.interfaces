import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import Purchasable from './Purchasable.js';

class PurchasableCourseChoiceBundle extends Purchasable {
	static MimeType = COMMON_PREFIX + 'store.purchasablecoursechoicebundle';
}

export default decorate(PurchasableCourseChoiceBundle, [model]);
