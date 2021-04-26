import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class Metadata extends Base {
	static MimeType = COMMON_PREFIX + 'metadata.contentmetadata';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'contentLocation': { type: 'string'  },
		'contentMimeType': { type: 'string'  },
		'description':     { type: 'string'  },
		'images':          { type: 'model[]' },
		'sourceLocation':  { type: 'string'  },
		'sourcePath':      { type: 'string'  },
		'title':           { type: 'string'  },
	}
}

Registry.register(Metadata);
