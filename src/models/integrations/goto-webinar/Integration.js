import {model, COMMON_PREFIX} from '../../Registry';
import Integration from '../Integration';

const DISCONNECTED_MIMETYPE = COMMON_PREFIX + 'integration.gotowebinarintegration';
const CONNECTED_MIMETYPE = COMMON_PREFIX + 'integration.gotowebinarauthorizedintegration';

export default
@model
class GotoWebinar extends Integration {
	static MimeType = [
		DISCONNECTED_MIMETYPE,
		CONNECTED_MIMETYPE
	]


	static Fields = {
		...Integration.Fields,
		'webinar_realname': {type: 'string', name: 'accountName'}
	}

	name = 'goto-webinar'

	isEnabled () {
		return true;
	}

	isConnected () {
		return this.MimeType === CONNECTED_MIMETYPE;
	}

	canConnect () {
		return !this.isConnected();
	}

	canDisconnect () {
		return this.isConnected();
	}

	getConnectLink (...args) {
		return this.getLink('authorize.webinar', ...args);
	}

	getAccountName () {
		return this.accountName;
	}

	async disconnect () {
		//If we aren't connected there's nothing to delete
		if (!this.isConnected()) {
			return;
		}

		const resp = await this.delete();

		await this.sync();

		return resp;
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
