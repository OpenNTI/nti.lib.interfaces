import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class WebinarAsset extends Base {
	static MimeType = COMMON_PREFIX + 'webinarasset'

	static Fields = {
		...Base.Fields,
		'webinar': { type: 'model' },
	}
}
