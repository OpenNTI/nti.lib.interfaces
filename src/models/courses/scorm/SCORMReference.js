import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
class SCORMReference extends Base {
	static MimeType = [
		COMMON_PREFIX + 'scormcontentref'
	]

	static Fields = {
		...Base.Fields,
		'scorm_id':    { type: 'string', name: 'scormId' },
		'title':       { type: 'string'                  },
		'description': { type: 'string',                 }
	}
}