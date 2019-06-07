import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
class SCORMContentInfo extends Base {
	static MimeType = [
		COMMON_PREFIX + 'courseware_scorm.scormcontentinfo'
	]

	static Fields = {
		...Base.Fields,
		'scorm_id': {type: 'string', name: 'scormId'},
		'title':    {type: 'string'                 }
	}
}