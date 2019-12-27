import {getMetaDataEntryPoint} from '../MetaDataResolverForWistia';

/*
 useful links:
 https://wistia.com/support/developers/construct-an-embed-code#fallback-iframe-embed-tutorial
 https://wistia.com/support/developers/player-api#legacy-api-embeds
 https://wistia.com/support/developers/embed-links
 */

const WistiaRegex = /https?:\/\/(.+)?(wistia\.com|wi\.st)\/.*/;

function getIDFromIframe (html) {

}

export default class WistiaProvider {
	static service = 'wistia';

	static handles (uri) {
		return WistiaRegex.test(uri);
	}

	static getID (href) {
		return null;
	}

	static resolveID (service, url) {
		const endpoint = getMetaDataEntryPoint(url);

		return fetch(endpoint)
			.then((resp) => {
				if (!resp.ok) {
					throw new Error(`Invalid: ${resp.statusCode}: ${resp.statusText}`);
				}

				return resp.json();
			})
			.then((data) => {
				return getIDFromIframe(data.html);
			});
	}

	static getCanonicalURL (uri, videoId) {

	}
}