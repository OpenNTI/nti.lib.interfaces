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

	isConnected () {
		return this.hasLink(DisconnectRel);
	}

	canConnect () {
		return this.hasLink(ConnectRel);
	}

	canDisconnect () {
		return this.hasLink(DisconnectRel);
	}
}