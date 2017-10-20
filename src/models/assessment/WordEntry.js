import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class WordEntry extends Base {
	static MimeType = COMMON_PREFIX + 'naqwordentry'

	static Fields = {
		...Base.Fields,
		'wid':     { type: 'string' },
		'content': { type: 'string' }
	};
}
