import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
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
