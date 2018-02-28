import { model, COMMON_PREFIX } from '../../Registry';
import Base from '../../Base';

export default
@model
class SCORMCourseMetadata extends Base {
	static MimeType = [
		COMMON_PREFIX + 'courseware_scorm.scormcoursemetadata',
	]

	static Fields = {
		...Base.Fields,
		'scorm_id': { type: 'string', name: 'scormId' }
	}
}