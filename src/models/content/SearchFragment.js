import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class Metadata extends Base {
	static MimeType = COMMON_PREFIX + 'search.searchfragment'

	static Fields = {
		'Matches': { type: 'string[]' },
		'Field':   { type: 'string'   },
	}
}
