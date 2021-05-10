import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Instance from '../Instance.js';

export default class ScormInstance extends Instance {
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

Registry.register(ScormInstance);
