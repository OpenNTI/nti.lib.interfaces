
//const URL = '//vimeo.com/api/v2/video/{0}.json',
const URL = 'https://vimeo.com/api/oembed.json?url=https%3A//vimeo.com/{0}';

const FAIL = 'data:,';

export default class MetaDataResolverForVimeo {

	static resolve (service, source) {

		let id = source.source;
		id = Array.isArray(id) ? id[0] : id;

		let url = URL.replace('{0}', id);
		// console.log(url);
		return service.get(url)
				.then(o=> o[0] || o)
				.then(o=>
					({
						poster: o.thumbnail_url,
						thumbnail: o.thumbnail_url
					})
				)
				.catch(failure => ({
					failure,
					poster: FAIL,
					thumbnail: FAIL
				}));

		/*
		author_name: "Oklahoma State University"
		author_url: "http://vimeo.com/osu"
		description: ""
		duration: 788
		height: 480
		html: "<iframe..."
		is_plus: "0"
		provider_name: "Vimeo"
		provider_url: "https://vimeo.com/"
		thumbnail_height: 427
		thumbnail_url: "http://i.vimeocdn.com/video/500719224_640.jpg"
		thumbnail_width: 640
		title: "Academic Integrity"
		type: "video"
		uri: "/videos/114672468"
		version: "1.0"
		video_id: 114672468
		width: 720
		 */
	}
}
