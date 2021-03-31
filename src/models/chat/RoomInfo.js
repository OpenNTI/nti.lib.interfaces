import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class RoomInfo extends Base {
	static MimeType = [
		COMMON_PREFIX + '_meeting',
		COMMON_PREFIX + 'meeting',
		COMMON_PREFIX + 'roominfo',
	];

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'Active':       { type: 'boolean',  name: 'isActive'     },
		'MessageCount': { type: 'number',   name: 'messageCount' },
		'Moderated':    { type: 'boolean',  name: 'isModerated'  },
		'Moderators':   { type: 'string[]', name: 'moderators'   },
		'Occupants':    { type: 'string[]', name: 'occupants'    },
	}
}

export default decorate(RoomInfo, { with: [model] });
