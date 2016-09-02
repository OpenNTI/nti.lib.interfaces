import join from 'nti-commons/lib/url-join';

const getRoot = x => (x ? x.root : x) || '/missing-root/';

//MimeType: "application/vnd.nextthought.slide"
export default class Slide {

	constructor (service, parent, data) {
		// super(service, parent);

		const define = (name, value) => Object.defineProperty(this, name, {value, writable: false});
		const root = getRoot((parent && parent.parent) ? parent.parent('root') : null);

		define('deckId', data.slidedeckid);
		define('image', join(root, data.slideimage));
		define('number', data.slidenumber);

		//Start & End are in seconds.
		define('startTime', parseFloat(data.slidevideostart));
		define('endTime', parseFloat(data.slidevideoend));

		define('videoId', data.slidevideoid);
	}
}
