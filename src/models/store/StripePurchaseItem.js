import { Parser as parse } from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

const TakeOver = Symbol.for('TakeOver');
const Items = Symbol('Items');

export default
@model
class StripePurchaseItem extends Base {
	static MimeType = COMMON_PREFIX + 'store.stripepurchaseitem'

	constructor (service, parent, data) {
		super(service, parent, data);

		const rename = (x, y) => this[TakeOver](x, y);

		this[parse]('Items');

		rename('Coupon', 'coupon');
		rename('Items', Items);
		rename('Quantity', 'quantity');
	}
}
