import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Model.js';

export default class WebinarSession extends Base {
	static MimeType = COMMON_PREFIX + 'webinarsession';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'startTime': { type: 'date' },
		'endTime':   { type: 'date' }
	};

	getStartTime() {} //implemented by startTime date field.
	getEndTime() {} //implemented by endTime date field.
}

Registry.register(WebinarSession);
