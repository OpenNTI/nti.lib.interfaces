import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry';
import Base from '../Base';

class Timeline extends Base {
	static MimeType = COMMON_PREFIX + 'ntitimeline';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'desc':             { type: 'string'  },
		'description':      { type: 'string'  },
		'icon':             { type: 'string'  },
		'label':            { type: 'string'  },
		'suggested-inline': { type: 'boolean' },
	}
}

export default decorate(Timeline, { with: [model] });
