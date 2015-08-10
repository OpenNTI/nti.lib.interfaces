/* global Stripe */

import {Context, Server} from '../CommonSymbols';

import {parse} from '../models';

import ServiceModel from '../stores/Service';

let pollInterval = 1000;

const PollPurchaseAttempt = 'Begin Polling Purchase Attempt Endpoint';


export default class StripeInterface {
	static fromService (service) {
		let server = service[Server];
		let context = service[Context];
		return new this(server, context);
	}

	constructor (server, context) {
		Object.assign(this, {
			get: ServiceModel.prototype.get,
			post: ServiceModel.prototype.post
		});
		this[Server] = server;
		this[Context] = context;
	}

	getServer () { return this[Server]; }


	getPricing (purchasable) {
		let link = purchasable.getLink('price');
		if (link) {
			return this.post(link, {purchasableID: purchasable.ID})
				.then(o => parse(this, this, o));
		}
		throw new Error('Unable to find price link for provided Purchasable');
	}


	getCouponPricing (purchasable, coupon) {
		let link = purchasable.getLink('price_purchasable_with_stripe_coupon');
		let data = { purchasableID: purchasable.ID };

		if (coupon) {
			data.Coupon = coupon;
		}

		if (link) {
			return this.post(link, data)
				.then(o=> parse(
					this, //should be an instance of Service, but we don't have one. :/
					this,
					o));
		}

		throw new Error('Unable to find price with coupon link for purchasable');
	}

	getToken (stripePublicKey, data) {
		return new Promise(fulfill => {
			Stripe.setPublishableKey(stripePublicKey);
			Stripe.card.createToken(data, (status, response) => {
				//if (response.error) {return reject(response.error);}
				fulfill({ status, response });
			});
		});
	}

	submitPayment (data) {
		let {stripeToken, purchasable, pricing, giftInfo} = data;

		let linkRel = giftInfo ? 'gift_stripe_payment' : 'post_stripe_payment';
		let pollUrl = giftInfo ? '/dataserver2/store/get_gift_purchase_attempt' : '/dataserver2/store/get_purchase_attempt';
		let paymentUrl = purchasable.getLink(linkRel);
		let payload = {
			PurchasableID: purchasable.ID,
			token: stripeToken.id,
			context: {
				AllowVendorUpdates: data.allowVendorUpdates
			}
		};

		if (giftInfo) {
			payload = Object.assign(payload, giftInfo);
		}

		if (pricing) {
			if (pricing.coupon != null) {
				payload.coupon = pricing.coupon;
			}

			if (pricing.expected_price != null) {
				payload.expectedAmount = pricing.expected_price;
			}
		}


		return this.post(paymentUrl, payload)
			.then(collection => parse(this, this, collection.Items))
			.then(collection => collection[0])
			.then(attempt => this[PollPurchaseAttempt](attempt.getID(), attempt.creator, pollUrl));
	}


	[PollPurchaseAttempt] (purchaseId, creator, pollUrl) {
		let me = this;

		return new Promise((fulfill, reject) => {

			function pollResponse (attempt) {
				if(/^Failed|Success$/i.test(attempt.state)) {
					return fulfill(attempt);
				}

				setTimeout(check, pollInterval);
			}


			function check () {
				//URI Encoding purchase id for polling to work with broken server.
				let params = '?purchaseId=' + encodeURIComponent(purchaseId);

				if (creator) {
					params += '&creator=' + encodeURIComponent(creator);
				}

				me.get(pollUrl + params)
					.then(o => o.Items)
					.then(items => parse(this, this, items))
					.then(items => items.length === 1 ? items[0] : Promise.reject(items))
					.then(pollResponse)
					.catch(reject);
			}

			check();
		});
	}

}
