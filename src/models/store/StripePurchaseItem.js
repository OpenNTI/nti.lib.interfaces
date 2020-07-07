import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

const Items = Symbol('Items');

class StripePurchaseItem extends Base {
	static MimeType = COMMON_PREFIX + 'store.stripepurchaseitem'

	static Fields = {
		...Base.Fields,
		'Coupon':   { type: 'string',  name: 'coupon'   },
		'Items':    { type: 'model[]', name: Items      },
		'Quantity': { type: 'number',  name: 'quantity' },
	}
}

export default decorate(StripePurchaseItem, {with:[model]});
