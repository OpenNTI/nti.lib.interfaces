import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class SlideVideo extends Base {
	static MimeType = COMMON_PREFIX + 'ntislidevideo';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'byline':        { type: 'string'                      },
		'DCDescription': { type: 'string', name: 'description' },
		'DCTitle':       { type: 'string', name: 'title'       },
		'slidedeckid':   { type: 'string', name: 'deckId'      },
		'thumbnail':     { type: 'string'                      },
		'video-ntiid':   { type: 'string', name: 'videoId'     },
	}
}

export default decorate(SlideVideo, [model]);
