import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Model.js';

export class SCORMCourseMetadata extends Base {
	static MimeType = [COMMON_PREFIX + 'courseware_scorm.scormcoursemetadata'];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'scorm_id': { type: 'string', name: 'scormId' }
	};
}

Registry.register(SCORMCourseMetadata);
