import {model, COMMON_PREFIX} from '../Registry';

import StripePurchaseItem from './StripePurchaseItem';

@model
export default class StripePurchaseOrder extends StripePurchaseItem {
	static MimeType = COMMON_PREFIX + 'store.stripepurchaseorder'

	constructor (service, parent, data) {
		super(service, parent, data);
	}
}
