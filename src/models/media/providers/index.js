import kaltura from './kaltura.js';
import vimeo from './vimeo.js';
import youtube from './youtube.js';
import wistia from './wistia.js';
import { ensureProtocol } from './utils.js';

const providers = [kaltura, vimeo, youtube, wistia];

export {
	kaltura as KalturaProvider,
	vimeo as VimeoProvider,
	youtube as YouTubeProvider,
	wistia as WistiaProvider,
};

//TODO: Add a HTML5 provider so we can handle direct video file urls as a dynamic source.

export function resolveProvider(src) {
	return providers.find(x => x.handles(ensureProtocol(src)));
}
