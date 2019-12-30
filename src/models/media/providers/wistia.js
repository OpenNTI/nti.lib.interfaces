import {getMetaDataEntryPoint} from '../MetaDataResolverForWistia';

/*
 useful links:
 https://wistia.com/support/developers/construct-an-embed-code#fallback-iframe-embed-tutorial
 https://wistia.com/support/developers/player-api#legacy-api-embeds
 https://wistia.com/support/developers/embed-links
 */

const WistiaRegex = /https?:\/\/(.+)?(wistia\.com|wi\.st)\/.*/;
const IdRegexs = [
	(href) => {
		const matches = href.match(/https?:\/\/(.+)?(wistia\.com|wi\.st)\/embed\/iframe\/(.*)/);

		return matches[3];
	}
];

export default class WistiaProvider {
	static service = 'wistia';

	static handles (uri) {
		return WistiaRegex.test(uri);
	}

	static getID (href) {
		for (let idRegex of IdRegexs) {
			const id = idRegex(href);

			if (id) { return id; }
		}
	}

	static resolveID (service, url) {
		const endpoint = getMetaDataEntryPoint(url);

		return fetch(endpoint)
			.then((resp) => {
				if (!resp.ok) {
					throw new Error(`Invalid: ${resp.statusCode}: ${resp.statusText}`);
				}
			})
			.then(() => {
				return this.getID(url);
			});
	}

	static getCanonicalURL (uri, videoId) {
		const id = videoId || this.getID(uri);

		return `https://fast.wisita.net/embed/iframe/${id}`;
	}
}