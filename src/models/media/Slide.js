import {URL} from 'nti-commons';

import {model, COMMON_PREFIX} from '../Registry';

const getRoot = x => (x ? x.root : x) || '/missing-root/';

@model
export default class Slide {
	static MimeType = COMMON_PREFIX + 'slide'

	constructor (service, parent, data) {

		const define = (name, value) => Object.defineProperty(this, name, {value, writable: false});
		const root = getRoot((parent && parent.parent) ? parent.parent('root') : null);

		define('deckId', data.slidedeckid);
		define('image', URL.resolve(root, data.slideimage));
		define('number', data.slidenumber);

		//Start & End are in seconds.
		define('startTime', parseFloat(data.slidevideostart));
		define('endTime', parseFloat(data.slidevideoend));

		define('videoId', data.slidevideoid);
	}
}
