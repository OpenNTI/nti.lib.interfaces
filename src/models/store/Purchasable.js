import Base from '../Base';
import { Parser as parse } from '../../constants';

const TakeOver = Symbol.for('TakeOver');

const StripeConnectKey = Symbol('StripeConnectKey');

export default class Purchasable extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);

		const rename = (x, y) => this[TakeOver](x, y);

		this[parse]('StripeConnectKey');

		rename('StripeConnectKey', StripeConnectKey);

		//rename('VendorInfo', 'vendorInfo');

		rename('Activated', 'activated');
		rename('Amount', 'amount');
		rename('BulkPurchase', 'bulkPurchase');//unclear
		rename('Currency', 'currency');
		rename('Discountable', 'discountable');
		rename('Fee', 'fee');
		rename('Giftable', 'giftable');
		rename('IsPurchasable', 'enabled');
		rename('Name', 'name');
		rename('Provider', 'provider');
		rename('Redeemable', 'redeemable');
		rename('Title', 'title');

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
