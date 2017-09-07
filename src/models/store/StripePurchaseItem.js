import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

const Items = Symbol('Items');

export default
@model
class StripePurchaseItem extends Base {
	static MimeType = COMMON_PREFIX + 'store.stripepurchaseitem'

	static Fields = {
		...Base.Fields,
		'Coupon':   { type: 'string',  name: 'coupon'   },
		'Items':    { type: 'model[]', name: Items      },
		'Quantity': { type: 'number',  name: 'quantity' },
	}
}
