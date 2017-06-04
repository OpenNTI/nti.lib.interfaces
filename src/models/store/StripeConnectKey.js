import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

@model
export default class StripeConnectKey extends Base {
	static MimeType = COMMON_PREFIX + 'store.stripeconnectkey'

	constructor (service, parent, data) {
		super(service, parent, data);
		/*
		Alias: "Janux"
		LiveMode: false
		PublicKey
		StripeUserID
		*/
	}
}
