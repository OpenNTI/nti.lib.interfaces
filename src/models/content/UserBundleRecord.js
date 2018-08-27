import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class UserBundleRecord extends Base {
	static MimeType = COMMON_PREFIX + 'userbundlerecord'

	static Fields = {
		...Base.Fields,
		'Bundle':       { type: 'model' },
		'User':         { type: 'model' },
		'LastSeenTime': { type: 'date' }
	}

}
