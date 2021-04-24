import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';

class SCORMCourseMetadata extends Base {
	static MimeType = [COMMON_PREFIX + 'courseware_scorm.scormcoursemetadata'];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'scorm_id': { type: 'string', name: 'scormId' }
	}
}

export default decorate(SCORMCourseMetadata, [model]);
