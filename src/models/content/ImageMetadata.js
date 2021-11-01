import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class ImageMetadata extends Base {
	static MimeType = COMMON_PREFIX + 'metadata.imagemetadata';
	// prettier-ignore
	static Fields = {
		...super.Fields,
		'height': { type: 'number' },
		'url':    { type: 'string' },
		'width':  { type: 'number' },
	};

	// known links:
	// - safeimage
}

Registry.register(ImageMetadata);
