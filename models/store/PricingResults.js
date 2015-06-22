import Base from '../Base';
import { Parser as parse } from '../../CommonSymbols';

const TakeOver = Symbol.for('TakeOver');

export default class PricingResults extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);

		this[parse]('Items');

		const rename = (x, y) => this[TakeOver](x, y);

		rename('Currency', 'currency');
		rename('TotalPurchasePrice');
		rename('TotalNonDiscountedPrice');
	}
}
