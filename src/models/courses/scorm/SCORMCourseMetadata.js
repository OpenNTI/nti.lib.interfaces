import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry';
import Base from '../../Base';

class SCORMCourseMetadata extends Base {
	static MimeType = [COMMON_PREFIX + 'courseware_scorm.scormcoursemetadata'];

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'scorm_id': { type: 'string', name: 'scormId' }
	}
}

export default decorate(SCORMCourseMetadata, { with: [model] });
