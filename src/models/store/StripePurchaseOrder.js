import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry';

import StripePurchaseItem from './StripePurchaseItem';

class StripePurchaseOrder extends StripePurchaseItem {
	static MimeType = COMMON_PREFIX + 'store.stripepurchaseorder';
}

export default decorate(StripePurchaseOrder, { with: [model] });
