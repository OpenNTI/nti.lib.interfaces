import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';

const ConnectRel = 'connect_stripe_account';
const DisconnectRel = 'disconnect_stripe_account';
const AccountInfoRel = 'account_info';

export default class StripeIntegration extends Base {
	static MimeType = [COMMON_PREFIX + 'integration.stripeintegration'];

	name = 'stripe';

	isEnabled() {
		return this.canConnect() || this.canDisconnect();
	}

	isConnected() {
		return this.hasLink(DisconnectRel);
	}

	canConnect() {
		return this.hasLink(ConnectRel);
	}

	canDisconnect() {
		return this.hasLink(DisconnectRel);
	}

	getConnectLink(...args) {
		return this.getLink(ConnectRel, ...args);
	}

	async getAccountName() {
		const info = await this.fetchLink({ mode: 'raw', rel: AccountInfoRel });

		return info && info.StripeAccountID;
	}

	async disconnect() {
		await this.deleteLink(DisconnectRel);
		await this.sync();
	}

	async sync() {
		const parent = this.parent();

		try {
			await parent.refresh();
			parent.onChange();
		} catch (e) {
			//swallow
		}
	}
}

Registry.register(StripeIntegration);
