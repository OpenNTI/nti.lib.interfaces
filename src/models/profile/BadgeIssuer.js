import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class BadgeIssuer extends Base {
	static MimeType = COMMON_PREFIX + 'openbadges.issuer'

	static Fields = {
		...Base.Fields,
		'description':    { type: 'string' },
		'email':          { type: 'string' },
		'image':          { type: 'string' },
		'name':           { type: 'string' },
		'revocationList': { type: '*'      },
		'url':            { type: 'string' },
	}
}
