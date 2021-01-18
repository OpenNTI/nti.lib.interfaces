import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../../Registry';
import BaseIntegration from '../Integration';

const ConnectRel = 'enable';
const ConnectMimeType = 'application/vnd.nextthought.site.acclaimintegration';

const DisconnectRel = 'disconnect';

class CredlyAcclaimIntegration extends BaseIntegration {
	static MimeType = [
		COMMON_PREFIX + 'site.acclaimintegration'
	]

	static Fields = {
		...BaseIntegration.Fields,
		'authorization_token': {type: 'string', name: 'authorizationToken'},
		'organization': {type: 'model'}
	}

	name = 'credly-acclaim'
	isCredilyAcclaimIntegration = true

	isEnabled () {
		return this.canConnect() || this.canDisconnect();
	}

	isConnected () {
		return Boolean(this.organization);
	}

	canConnect () {
		return this.hasLink(ConnectRel);
	}

	canDisconnect () {
		return this.hasLink(DisconnectRel);
	}

	async connect (authToken) {
		const resp = await this.postToLink(ConnectRel, {
			mimetype: ConnectMimeType,
			'authorization_token': authToken
		});

		await this.refresh(resp);
		this.onChange();
	}

	async disconnect () {
		await this.deleteLink(DisconnectRel);
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

export default decorate(CredlyAcclaimIntegration, {with: [model]});
