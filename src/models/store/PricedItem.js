import Base from '../Base';

const TakeOver = Symbol.for('TakeOver');

export default class PricedItem extends Base {
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
