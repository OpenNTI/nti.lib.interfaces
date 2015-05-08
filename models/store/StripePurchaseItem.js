import Base from '../Base';
import { Parser as parse } from '../../CommonSymbols';

const TakeOver = Symbol.for('TakeOver');
const Items = Symbol('Items');

export default class StripePurchaseItem extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);

		const rename = (x, y) => this[TakeOver](x, y);

		this[parse]('Items');

		rename('Coupon', 'coupon');
		rename('Items', Items);
		rename('Quantity', 'quantity');
	}
}
