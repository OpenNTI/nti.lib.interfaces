import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class UserBundleRecord extends Base {
	static MimeType = COMMON_PREFIX + 'userbundlerecord';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'Bundle':       { type: 'model'  },
		'User':         { type: 'model'  },
		'LastSeenTime': { type: 'date'   },
		'Reports':      { type: 'model[]'}
	}
}

export default decorate(UserBundleRecord, [model]);
