import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Model.js';

export class GoogleAPIKey extends Base {
	static async fetch(service) {
		const APIKey = await service
			.getUserWorkspace()
			?.fetchLink?.('GoogleAPIKey');
		return APIKey;
	}

	static MimeType = [COMMON_PREFIX + 'google.googleapikey'];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		appid: { type: 'string', name: 'AppId' },
		key:   { type: 'string'                }
	};

	getAuthLink(origin) {
		const link = this.getLink('google.authorize');

		return `${origin ?? ''}${link}`;
	}
}

Registry.register(GoogleAPIKey);
