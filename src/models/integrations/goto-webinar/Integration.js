import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry.js';
import Integration from '../Integration.js';

const DISCONNECTED_MIMETYPE =
	COMMON_PREFIX + 'integration.gotowebinarintegration';
const CONNECTED_MIMETYPE =
	COMMON_PREFIX + 'integration.gotowebinarauthorizedintegration';

class GotoWebinar extends Integration {
	static MimeType = [DISCONNECTED_MIMETYPE, CONNECTED_MIMETYPE];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'webinar_realname': {type: 'string', name: 'accountName'}
	}

	name = 'goto-webinar';

	isEnabled() {
		return true;
	}

	isConnected() {
		return this.MimeType === CONNECTED_MIMETYPE;
	}

	canConnect() {
		return !this.isConnected();
	}

	canDisconnect() {
		return this.isConnected();
	}

	getConnectLink(...args) {
		return this.getLink('authorize.webinar', ...args);
	}

	getAccountName() {
		return this.accountName;
	}

	async disconnect() {
		//If we aren't connected there's nothing to delete
		if (!this.isConnected()) {
			return;
		}

		const resp = await this.delete();

		await this.sync();

		return resp;
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

export default decorate(GotoWebinar, [model]);
