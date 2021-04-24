import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';

class GoogleAPIKey extends Base {
	static MimeType = [COMMON_PREFIX + 'google.googleapikey'];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		appid: { type: 'string', name: 'AppId' },
		key:   { type: 'string', name: 'DevKey' }
	}

	getAuthLink(origin) {
		const link = this.getLink('google.authorize');

		return `${origin ?? ''}${link}`;
	}
}

export default decorate(GoogleAPIKey, [model]);
