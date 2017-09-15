import {URL} from 'nti-commons';

import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

const getRoot = x => (x ? x.root : x) || '/missing-root/';
const findRoot = p => getRoot((p && p.parent) ? p.parent('root') : null);
const resolve = (s, p, path) => URL.resolve(findRoot(p), path);
const float = (_,__, v) => float(v);

export default
@model
class Slide extends Base {
	static MimeType = COMMON_PREFIX + 'slide'

	static Fields = {
		...Base.Fields,
		'slideimage':      { type: resolve,  name: 'image'     },
		'slidedeckid':     { type: 'string', name: 'deckId'    },
		'slidevideoid':    { type: 'string', name: 'videoId'   },
		'slidenumber':     { type: 'string', name: 'number'    },
		'slidevideostart': { type: 'number', name: 'startTime' },
		'slidevideoend':   { type: 'number', name: 'endTime'   },
	}
}
