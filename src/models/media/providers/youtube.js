import { getVideo } from './utils';

const YOU_TUBE = 'https://www.youtube.com';

export default class YouTubeProvider {
	static service = 'youtube';

	static handles(uri) {
		const { service } = getVideo(uri) || {};
		return service === this.service;
	}

	static getID(uri) {
		const { id } = getVideo(uri) || {};
		return id;
	}

	static getCanonicalURL(uri, videoId) {
		const id = videoId || this.getID(uri);
		return `${YOU_TUBE}/embed/${id}`;
	}

	constructor(service) {}
}
