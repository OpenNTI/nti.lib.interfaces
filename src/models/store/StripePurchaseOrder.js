import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import StripePurchaseItem from './StripePurchaseItem.js';

class StripePurchaseOrder extends StripePurchaseItem {
	static MimeType = COMMON_PREFIX + 'store.stripepurchaseorder';
}

export default decorate(StripePurchaseOrder, { with: [model] });
