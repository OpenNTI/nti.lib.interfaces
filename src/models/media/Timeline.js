import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

export default class Timeline extends Base {
	static MimeType = COMMON_PREFIX + 'ntitimeline';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Target-NTIID':     { type: 'string'  },
		'desc':             { type: 'string'  },
		'description':      { type: 'string'  },
		'icon':             { type: 'string'  },
		'label':            { type: 'string'  },
		'suggested-inline': { type: 'boolean' },
	};
}

Registry.register(Timeline);
