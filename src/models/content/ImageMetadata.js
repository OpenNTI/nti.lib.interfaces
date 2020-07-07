import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

class ImageMetadata extends Base {
	static MimeType = COMMON_PREFIX + 'metadata.imagemetadata'
	static Fields = {
		...Base.Fields,
		'height': { type: 'number' },
		'url':    { type: 'string' },
		'width':  { type: 'number' },
	}

	// known links:
	// - safeimage
}


export default decorate(ImageMetadata, {with:[model]});
