import { model, COMMON_PREFIX } from '../../Registry';
import Instance from '../Instance';

export default
@model
class ScormInstance extends Instance {
	static MimeType = [
		COMMON_PREFIX + 'courses.scormcourseinstance',
	]

	static Fields = {
		...Instance.Fields,
		Metadata: { type: 'model' }
	}

	isScormInstance = true;

	getScormCourse () {
		return this.Metadata.getLink('LaunchSCORM');
	}
}
