import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class BadgeIssuer extends Base {
	static MimeType = COMMON_PREFIX + 'openbadges.issuer';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'description':    { type: 'string' },
		'email':          { type: 'string' },
		'image':          { type: 'string' },
		'name':           { type: 'string' },
		'revocationList': { type: '*'      },
		'url':            { type: 'string' },
	};
}

Registry.register(BadgeIssuer);
