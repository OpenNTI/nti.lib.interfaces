import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

class GoogleAPIKey extends Base {
	static MimeType = [
		COMMON_PREFIX + 'google.googleapikey'
	]

	static Fields = {
		...Base.Fields,
		appid: { type: 'string', name: 'AppId' },
		key:   { type: 'string', name: 'DevKey' }
	}

	getAuthLink (origin) {
		const link = this.getLink('google.authorize');

		return `${origin ?? ''}${link}`;
	}

}

export default decorate(GoogleAPIKey, {with:[model]});