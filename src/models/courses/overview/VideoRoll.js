import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
class VideoRoll extends Base {
	static MimeType = COMMON_PREFIX + 'videoroll'

	static Fields = {
		...Base.Fields,
		'Items': { type: 'model[]' },
	}
}
