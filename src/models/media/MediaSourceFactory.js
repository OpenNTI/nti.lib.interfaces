import MediaSource from './MediaSource.js';
import { resolveProvider } from './providers/index.js';

export default class MediaSourceFactory {
	static async from(service, uri) {
		const provider = resolveProvider(uri);
		if (!provider) {
			return;
		}

		const videoId =
			provider.getID(uri) || (await provider.resolveID(service, uri));
		const canonicalUrl = provider.getCanonicalURL(uri, videoId);

		return new MediaSource(service, null, {
			service: provider.service,
			href: canonicalUrl,
			source: videoId,
		});
	}
}
