import Registry, { COMMON_PREFIX } from '../../Registry.js';
import BaseIntegration from '../Integration.js';

const ConnectRel = 'enable';
const ConnectMimeType = 'application/vnd.nextthought.site.acclaimintegration';

const DisconnectRel = 'disconnect';

export default class CredlyAcclaimIntegration extends BaseIntegration {
	static MimeType = [COMMON_PREFIX + 'site.acclaimintegration'];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'authorization_token': {type: 'string', name: 'authorizationToken'},
		'organization': {type: 'model'}
	}

	name = 'credly-acclaim';
	isCredilyAcclaimIntegration = true;

	isEnabled() {
		return this.canConnect() || this.canDisconnect();
	}

	isConnected() {
		return Boolean(this.organization);
	}

	canConnect() {
		return this.hasLink(ConnectRel);
	}

	canDisconnect() {
		return this.hasLink(DisconnectRel);
	}

	async connect(authToken) {
		await this.fetchLink({
			method: 'post',
			mode: 'raw',
			rel: ConnectRel,
			data: {
				mimetype: ConnectMimeType,
				authorization_token: authToken,
			},
		});

		await this.sync();
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

Registry.register(CredlyAcclaimIntegration);
