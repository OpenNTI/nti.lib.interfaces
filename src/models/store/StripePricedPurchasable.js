import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry';
import Base from '../Base';

import Coupon from './StripeCoupon';

class StripePricedPurchasable extends Base {
	static MimeType = COMMON_PREFIX + 'store.stripepricedpurchasable';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'Amount':             { type: 'number',  name: 'amount'             },
		'Coupon':             { type: Coupon,    name: 'coupon'             },
		'Currency':           { type: 'string',  name: 'currency'           },
		'NonDiscountedPrice': { type: 'number',  name: 'priceNotDiscounted' },
		'PurchasePrice':      { type: 'number',  name: 'price'              },
		'Quantity':           { type: 'number',  name: 'quantity'           },
		'Provider':           { type: 'string'                              },
	}
}

export default decorate(StripePricedPurchasable, { with: [model] });
