import {model, COMMON_PREFIX} from '../Registry';

import Purchasable from './Purchasable';

export default
@model
class PurchasableCourse extends Purchasable {
	static MimeType = COMMON_PREFIX + 'store.purchasablecourse'

	constructor (service, parent, data) {
		super(service, parent, data);
	}
}
