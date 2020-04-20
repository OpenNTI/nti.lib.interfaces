import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

const ConnectRel = 'connect_stripe_account';
const DisconnectRel = 'disconnect_stripe_account';

export default
@model
class StripeIntegration extends Base {
	static MimeType = [
		COMMON_PREFIX + 'integration.stripeintegration'
	]

	name = 'stripe'

	isEnabled () {
		return this.canConnect() || this.canDisconnect();
	}

	isConnected () {
		return this.hasLink(DisconnectRel);
	}

	canConnect () {
		return this.hasLink(ConnectRel);
	}

	canDisconnect () {
		return this.hasLink(DisconnectRel);
	}

	getConnectLink (...args) {
		return this.getLink(ConnectRel, ...args);
	}

	getAccountName () {
		return 'Test Stripe Account';
	}
	
	async disconnect () {
		await this.requestLink(DisconnectRel, 'delete');
		await this.sync();
	}

	async sync () {
		const parent = this.parent();

		try {
			await parent.refresh();
			parent.onChange();
		} catch (e) {
			//swallow
		}
	}
}