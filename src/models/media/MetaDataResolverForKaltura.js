export default class MetaDataResolverForVimeo {

	static resolve (service, source) {
		let id = source.source;
		id = Array.isArray(id) ? id[0] : id;

		const [partnerId, videoId] = id.split(':');

		const w = 1280;
		const poster =	`//www.kaltura.com/p/${partnerId}/thumbnail/entry_id/${videoId}/width/${w}/`;

		return Promise.resolve({
			poster
		});
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
