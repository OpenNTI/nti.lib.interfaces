import {model, COMMON_PREFIX} from './Registry';
import Base from './Base';

export default
@model
class Change extends Base {
	static MimeType = COMMON_PREFIX + 'change'

	static Fields = {
		...Base.Fields,
		'Item': { type: 'model' }
	}

}
