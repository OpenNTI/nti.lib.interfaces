import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class SlideVideo extends Base {
	static MimeType = COMMON_PREFIX + 'ntislidevideo'

	static Fields = {
		...Base.Fields,
		'byline':        { type: 'string'                      },
		'DCDescription': { type: 'string', name: 'description' },
		'DCTitle':       { type: 'string', name: 'title'       },
		'slidedeckid':   { type: 'string', name: 'deckId'      },
		'thumbnail':     { type: 'string'                      },
		'video-ntiid':   { type: 'string', name: 'videoId'     },
	}
}
