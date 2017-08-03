// import { Parser as parse } from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

const TakeOver = Symbol.for('TakeOver');


class Coupon extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);

		const rename = (x, y) => this[TakeOver](x, y);

		rename('AmountOff', 'amountOff');
		rename('Currency', 'currency');
		rename('Duration', 'duration');
		rename('PercentOff', 'percentOff');

		rename('TimesRedeemed', 'timesRedeemed');
	}

	getID () { return this.ID; }

	getCode () { return this.ID; }
}


export default
@model
class StripePricedPurchasable extends Base {
	static MimeType = COMMON_PREFIX + 'store.stripepricedpurchasable'

	constructor (service, parent, data) {
		super(service, parent, data);
		/*
		Amount: 250
		Currency: "USD"

		NonDiscountedPrice: 250
		PurchasePrice: 150
		Quantity: 1

		Provider: "Janux"
		 */

		const rename = (x, y) => this[TakeOver](x, y);

		//Why isn't this parsed like normal? no mimeType?
		this.Coupon = this.Coupon && new Coupon(service, this, this.Coupon);

		rename('Amount', 'amount');
		rename('Coupon', 'coupon');
		rename('Currency', 'currency');

		rename('NonDiscountedPrice', 'priceNotDiscounted');
		rename('PurchasePrice', 'price');

		rename('Quantity', 'quantity');
	}
}
