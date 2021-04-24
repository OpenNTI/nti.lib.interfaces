import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';

class WebinarSession extends Base {
	static MimeType = COMMON_PREFIX + 'webinarsession';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'startTime': { type: 'date' },
		'endTime':   { type: 'date' }
	}

	getStartTime() {} //implemented by startTime date field.
	getEndTime() {} //implemented by endTime date field.
}

export default decorate(WebinarSession, [model]);
