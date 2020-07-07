import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

class Metadata extends Base {
	static MimeType = COMMON_PREFIX + 'metadata.contentmetadata'

	static Fields = {
		...Base.Fields,
		'contentLocation': { type: 'string'  },
		'contentMimeType': { type: 'string'  },
		'description':     { type: 'string'  },
		'images':          { type: 'model[]' },
		'sourceLocation':  { type: 'string'  },
		'sourcePath':      { type: 'string'  },
		'title':           { type: 'string'  },
	}
}

export default decorate(Metadata, {with:[model]});
