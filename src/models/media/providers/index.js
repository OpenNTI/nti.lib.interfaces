import kaltura from './kaltura';
import vimeo from './vimeo';
import youtube from './youtube';
import {ensureProtocol} from './utils';

const providers = [
	kaltura,
	vimeo,
	youtube,
];

export {
	kaltura as KalturaProvider,
	vimeo as VimeoProvider,
	youtube as YouTubeProvider,
};

//TODO: Add a HTML5 provider so we can handle direct video file urls as a dynamic source.


export function resolveProvider (src) {
	return providers.find(x => x.handles(ensureProtocol(src)));
}
