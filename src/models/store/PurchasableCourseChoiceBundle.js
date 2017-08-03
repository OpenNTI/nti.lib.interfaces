import {model, COMMON_PREFIX} from '../Registry';

import Purchasable from './Purchasable';

export default
@model
class PurchasableCourseChoiceBundle extends Purchasable {
	static MimeType = COMMON_PREFIX + 'store.purchasablecoursechoicebundle'

	constructor (service, parent, data) {
		super(service, parent, data);
	}
}
