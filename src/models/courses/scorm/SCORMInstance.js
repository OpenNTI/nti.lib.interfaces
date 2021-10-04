import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Instance from '../Instance.js';

export class SCORMInstance extends Instance {
	static MimeType = [COMMON_PREFIX + 'courses.scormcourseinstance'];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		Metadata: { type: 'model' }
	}

	get isScormInstance() {
		return true;
	}

	getScormCourse() {
		return this.Metadata.getLink('LaunchSCORM');
	}
}

Registry.register(SCORMInstance);
