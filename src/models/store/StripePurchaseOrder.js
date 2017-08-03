import {model, COMMON_PREFIX} from '../Registry';

import StripePurchaseItem from './StripePurchaseItem';

export default
@model
class StripePurchaseOrder extends StripePurchaseItem {
	static MimeType = COMMON_PREFIX + 'store.stripepurchaseorder'

	constructor (service, parent, data) {
		super(service, parent, data);
	}
}
