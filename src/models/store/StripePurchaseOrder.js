import Registry, { COMMON_PREFIX } from '../Registry.js';

import StripePurchaseItem from './StripePurchaseItem.js';

export default class StripePurchaseOrder extends StripePurchaseItem {
	static MimeType = COMMON_PREFIX + 'store.stripepurchaseorder';
}

Registry.register(StripePurchaseOrder);
