import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

const Items = Symbol('Items');

export default class StripePurchaseItem extends Base {
	static MimeType = COMMON_PREFIX + 'store.stripepurchaseitem';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Coupon':   { type: 'string',  name: 'coupon'   },
		'Items':    { type: 'model[]', name: Items      },
		'Quantity': { type: 'number',  name: 'quantity' },
	}
}

Registry.register(StripePurchaseItem);
