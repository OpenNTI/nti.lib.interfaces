import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class SlideVideo extends Base {
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

Registry.register(SlideVideo);
