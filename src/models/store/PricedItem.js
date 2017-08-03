import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

const TakeOver = Symbol.for('TakeOver');

export default
@model
class PricedItem extends Base {
	static MimeType = COMMON_PREFIX + 'store.priceditem'

	constructor (service, parent, data) {
		super(service, parent, data);

		const rename = (x, y) => this[TakeOver](x, y);

		rename('Amount', 'amount');
		rename('Currency', 'currency');
		rename('Provider', 'provider');
		rename('PurchasePrice', 'purchasePrice');
		rename('Quantity', 'quantity');

	}
}
