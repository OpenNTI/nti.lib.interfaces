import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

class UserBundleRecord extends Base {
	static MimeType = COMMON_PREFIX + 'userbundlerecord'

	static Fields = {
		...Base.Fields,
		'Bundle':       { type: 'model'  },
		'User':         { type: 'model'  },
		'LastSeenTime': { type: 'date'   },
		'Reports':      { type: 'model[]'}
	}

}

export default decorate(UserBundleRecord, {with:[model]});
