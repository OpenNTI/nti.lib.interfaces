/* global Stripe */

import {Context, Server} from '../CommonSymbols';

import {parse} from '../models/Parser';

import ServiceModel from '../stores/Service';
import getLink from '../utils/getlink';

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
		//TODO: purchasable should be a model... getLink should be never imported outside of Base class for models
		let link = purchasable.getLink('price');
		if (link) {
			return this.post(link, {
				purchasableID: purchasable.ID
			});
		}
		throw new Error('Unable to find price link for provided Purchasable');
	}


	getCouponPricing (purchasable, coupon) {
		let link = purchasable.getLink('price_purchasable_with_stripe_coupon');
		let data = {
				purchasableID: purchasable.ID
			};

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
				fulfill({
					status: status,
					response: response
				});
			});
		});
	}

	submitPayment (data) {
		let {stripeToken, purchasable, pricing, giftInfo} = data;

		let linkRel = giftInfo ? 'gift_stripe_payment' : 'post_stripe_payment';
		let pollUrl = giftInfo ? '/dataserver2/store/get_gift_purchase_attempt' : '/dataserver2/store/get_purchase_attempt';
		let paymentUrl = getLink(purchasable.Links, linkRel);
		let payload = {
			PurchasableID: purchasable.ID,
			token: stripeToken,
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
			.then(result => {
				let attempt = result.Items[0];

				return this[PollPurchaseAttempt](attempt.ID, attempt.Creator, pollUrl);
			});
	}


	[PollPurchaseAttempt] (purchaseId, creator, pollUrl) {
		let me = this;

		return new Promise((fulfill, reject) => {

			function pollResponse(result) {
				let attempt = result.Items[0];
				if(/^Failed|Success$/i.test(attempt.State)) {
					return fulfill(attempt);
				}

				setTimeout(check, pollInterval);
			}


			function check() {
				console.warn('URI Encoding purchase id for polling to work with broken server.');
				let params = '?purchaseId=' + encodeURIComponent(purchaseId);

				if (creator) {
					params += '&creator=' + encodeURIComponent(creator);
				}

				me.get(pollUrl + params)
					.then(pollResponse)
					.catch(reject);
			}

			check();
		});
	}

}
