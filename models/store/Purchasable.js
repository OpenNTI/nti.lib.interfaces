import Base from '../Base';
import { Parser as parse } from '../../CommonSymbols';

const TakeOver = Symbol.for('TakeOver');

const StripeConnectKey = Symbol('StripeConnectKey');

export default class Purchasable extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);

		const rename = (x, y) => this[TakeOver](x, y);

		this[parse]('StripeConnectKey');

		rename('StripeConnectKey', StripeConnectKey);

		//rename('VendorInfo', 'vendorInfo');

		rename('Amount', 'amount');
		rename('Fee', 'fee');
		rename('Currency', 'currency');

		rename('IsPurchasable', 'enabled');
		rename('Redeemable', 'redeemable');
		rename('Activated', 'activated');
		rename('BulkPurchase', 'bulkPurchase');//unclear
		rename('Discountable', 'discountable');
		rename('Giftable', 'giftable');

		/*
		Author: null
		Name: "A History of the United States"
		Title: "A History of the United States"
		Provider: "Janux"
		*/
	}


	getStripeConnectKey () {
		return this[StripeConnectKey];
	}
}
