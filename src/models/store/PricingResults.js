import { Parser as parse } from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

const TakeOver = Symbol.for('TakeOver');

export default
@model
class PricingResults extends Base {
	static MimeType = COMMON_PREFIX + 'store.pricingresults'

	constructor (service, parent, data) {
		super(service, parent, data);

		this[parse]('Items');

		const rename = (x, y) => this[TakeOver](x, y);

		rename('Currency', 'currency');
		rename('TotalPurchasePrice');
		rename('TotalNonDiscountedPrice');
	}
}
