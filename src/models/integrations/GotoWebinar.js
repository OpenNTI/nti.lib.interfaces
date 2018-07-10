import {model, COMMON_PREFIX} from '../Registry';

import Integration from './Integration';

const DISCONNECTED_MIMETYPE = COMMON_PREFIX + 'integration.gotowebinarintegration';
const CONNECTED_MIMETYPE = COMMON_PREFIX + 'integration.gotowebinarauthorizedintegration';

export default
@model
class GotoWebinar extends Integration {
	static MimeType = [
		DISCONNECTED_MIMETYPE,
		CONNECTED_MIMETYPE
	]


	isConnected () {
		return this.MimeType === CONNECTED_MIMETYPE;
	}


	async disconnect () {
		//If we aren't connected there's nothing to delete
		if (!this.isConnected()) {
			return;
		}

		const resp = await this.delete();
		const parent = this.parent();

		try {
			await parent.refresh();
			parent.onChange();
		} catch (e) {
			//swallow
		}

		return resp;
	}
}
