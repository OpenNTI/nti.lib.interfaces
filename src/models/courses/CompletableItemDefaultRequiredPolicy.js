import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class CompletableItemDefaultRequiredPolicy extends Base {
	static MimeType = [
		COMMON_PREFIX + 'completion.defaultrequiredpolicy',
	]

	static Fields = {
		...Base.Fields,
		'mime_types': { type: 'string[]', name: 'mimeTypes' }
	}
}
