import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry.js';
import Instance from '../Instance.js';

class ScormInstance extends Instance {
	static MimeType = [COMMON_PREFIX + 'courses.scormcourseinstance'];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		Metadata: { type: 'model' }
	}

	isScormInstance = true;

	getScormCourse() {
		return this.Metadata.getLink('LaunchSCORM');
	}
}

export default decorate(ScormInstance, [model]);
