import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';

import Purchasable from './Purchasable';

class PurchasableCourseChoiceBundle extends Purchasable {
	static MimeType = COMMON_PREFIX + 'store.purchasablecoursechoicebundle'
}

export default decorate(PurchasableCourseChoiceBundle, {with:[model]});
