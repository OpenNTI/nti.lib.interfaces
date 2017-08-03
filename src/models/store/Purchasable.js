import { Parser as parse } from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

const TakeOver = Symbol.for('TakeOver');

const StripeConnectKey = Symbol('StripeConnectKey');

export default
@model
class Purchasable extends Base {
	static MimeType = COMMON_PREFIX + 'store.purchasable'

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
