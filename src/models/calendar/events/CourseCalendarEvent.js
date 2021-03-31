import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry.js';

import BaseEvent from './BaseEvent.js';

class CourseCalendarEvent extends BaseEvent {
	static MimeType = `${COMMON_PREFIX}courseware.coursecalendarevent`;

	// prettier-ignore
	static Fields = {
		...BaseEvent.Fields,
	}
}

export default decorate(CourseCalendarEvent, { with: [model] });
