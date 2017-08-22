import url from 'url';

const vimeoRe = /vimeo/i;
const VIMEO_URL_PARTS = /(?:https?:)?\/\/(?:(?:www|player)\.)?vimeo.com\/(?:(?:channels|video)\/(?:\w+\/)?|groups\/(?:[^/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?|#)/i;
const VIMEO_PROTOCOL_PARTS = /vimeo:\/\/(\d+\/)?(\d+)/i;

export const getMetaDataEntryPoint = x => `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(x)}`;

export default class VimeoProvider {

	static service = 'vimeo';


	static handles (uri) {
		const u = url.parse(uri);
		return vimeoRe.test(u.host) || vimeoRe.test(u.protocol);
	}


	static getID (uri) {
		/** @see test */

		const getFromCustomProtocol = x => x.match(VIMEO_PROTOCOL_PARTS);
		const getFromURL = x => x.match(VIMEO_URL_PARTS);

		const [/*matchedURL*/, /*albumId*/, id] = getFromCustomProtocol(uri) || getFromURL(uri) || [];
		return id || null;
	}


	/**
	 * Resolves custom URLs so we can get the ID for our uses.
	 *
	 * @param  {Service} service the service instance.
	 * @param  {string} uri the url of the vimeo video.
	 * @return {Promise} resolves with the video id, or rejects with an error.
	 */
	static resolveID (service, uri) {
		const endpoint = getMetaDataEntryPoint(uri);

		return fetch(endpoint)
			.then(response => {
				if (!response.ok) {
					throw new Error(`Invalid: ${response.statusCode}: ${response.statusText}`);
				}

				return response.json();
			})
			.then(data => data.video_id);
	}


	static getCanonicalURL (uri, videoId) {
		const id = videoId || this.getID(uri);
		return `https://www.vimeo.com/${id}`;
	}


	constructor (service) {

	}
}
