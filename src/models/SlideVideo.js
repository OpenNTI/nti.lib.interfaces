// import Base from './Base';

//MimeType: "application/vnd.nextthought.ntislidevideo"
export default class SlideVideo {

	constructor (service, parent, data) {
		// super(service, parent);

		const define = (name, value) => Object.defineProperty(this, name, {value, writable: false});

		define('deckId', data.slidedeckid);
		define('videoId', data['video-ntiid']);
		define('byline', data.byline);
		define('title', data.DCTitle);
		define('description', data.DCDescription);
		define('thumbnail', data.thumbnail);//poster?
	}
}
