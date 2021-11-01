import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

import Coupon from './StripeCoupon.js';

export default class StripePricedPurchasable extends Base {
	static MimeType = COMMON_PREFIX + 'store.stripepricedpurchasable';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Amount':             { type: 'number',  name: 'amount'             },
		'Coupon':             { type: Coupon,    name: 'coupon'             },
		'Currency':           { type: 'string',  name: 'currency'           },
		'NonDiscountedPrice': { type: 'number',  name: 'priceNotDiscounted' },
		'PurchasePrice':      { type: 'number',  name: 'price'              },
		'Quantity':           { type: 'number',  name: 'quantity'           },
		'Provider':           { type: 'string'                              },
	};
}

Registry.register(StripePricedPurchasable);
