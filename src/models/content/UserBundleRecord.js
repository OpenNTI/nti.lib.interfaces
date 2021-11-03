import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

export default class UserBundleRecord extends Base {
	static MimeType = COMMON_PREFIX + 'userbundlerecord';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Bundle':       { type: 'model'  },
		'User':         { type: 'model'  },
		'LastSeenTime': { type: 'date'   },
		'Reports':      { type: 'model[]'}
	};
}

Registry.register(UserBundleRecord);
