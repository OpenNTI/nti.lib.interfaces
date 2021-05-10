import Registry, { COMMON_PREFIX } from '../../Registry.js';

import BaseEvent from './BaseEvent.js';

export default class CourseCalendarEvent extends BaseEvent {
	static MimeType = `${COMMON_PREFIX}courseware.coursecalendarevent`;

	// prettier-ignore
	static Fields = {
		...super.Fields,
	}
}

Registry.register(CourseCalendarEvent);
