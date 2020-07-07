import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

class WebinarSession extends Base {
	static MimeType = COMMON_PREFIX + 'webinarsession'

	static Fields = {
		...Base.Fields,
		'startTime': { type: 'date' },
		'endTime':   { type: 'date' }
	}

	getStartTime () { } //implemented by startTime date field.
	getEndTime () { } //implemented by endTime date field.
}

export default decorate(WebinarSession, {with:[model]});
