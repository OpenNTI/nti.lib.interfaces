import MediaSource from './MediaSource';
import {resolveProvider} from './providers';


export default class MediaSourceFactory {

	static async from (service, uri) {
		const provider = resolveProvider(uri);
		if (!provider) {
			return;
		}

		const videoId = provider.getID(uri) || await provider.resolveID(service, uri);
		const canonicalUrl = provider.getCanonicalURL(uri, videoId);

		return new MediaSource(service, null, {
			service: provider.service,
			href: canonicalUrl,
			source: videoId
		});
	}

}
