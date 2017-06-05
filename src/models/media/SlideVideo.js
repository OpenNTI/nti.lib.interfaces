import {model, COMMON_PREFIX} from '../Registry';

@model
export default class SlideVideo {
	static MimeType = COMMON_PREFIX + 'ntislidevideo'

	constructor (service, parent, data) {

		const define = (name, value) => Object.defineProperty(this, name, {value, writable: false});

		define('deckId', data.slidedeckid);
		define('videoId', data['video-ntiid']);
		define('byline', data.byline);
		define('title', data.DCTitle);
		define('description', data.DCDescription);
		define('thumbnail', data.thumbnail);//poster?
	}
}
