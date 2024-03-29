import { url } from '@nti/lib-commons';

import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

const getRoot = x => (x ? x.root : x) || '/missing-root/';
const findRoot = p => getRoot(p && p.parent ? p.parent('root') : null);
const resolve = (s, p, path) => url.resolve(findRoot(p), path);

export default class Slide extends Base {
	static MimeType = COMMON_PREFIX + 'slide';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'slideimage':      { type: resolve,  name: 'image'     },
		'slidedeckid':     { type: 'string', name: 'deckId'    },
		'slidevideoid':    { type: 'string', name: 'videoId'   },
		'slidenumber':     { type: 'string', name: 'number'    },
		'slidevideostart': { type: 'number?', name: 'startTime' },
		'slidevideoend':   { type: 'number?', name: 'endTime'   },
	};
}

Registry.register(Slide);
