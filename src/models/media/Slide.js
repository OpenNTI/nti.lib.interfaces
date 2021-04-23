import { decorate, URL } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

const getRoot = x => (x ? x.root : x) || '/missing-root/';
const findRoot = p => getRoot(p && p.parent ? p.parent('root') : null);
const resolve = (s, p, path) => URL.resolve(findRoot(p), path);

class Slide extends Base {
	static MimeType = COMMON_PREFIX + 'slide';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'slideimage':      { type: resolve,  name: 'image'     },
		'slidedeckid':     { type: 'string', name: 'deckId'    },
		'slidevideoid':    { type: 'string', name: 'videoId'   },
		'slidenumber':     { type: 'string', name: 'number'    },
		'slidevideostart': { type: 'number?', name: 'startTime' },
		'slidevideoend':   { type: 'number?', name: 'endTime'   },
	}
}

export default decorate(Slide, [model]);
