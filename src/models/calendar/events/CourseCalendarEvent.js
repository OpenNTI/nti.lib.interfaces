import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../../Registry';

import BaseEvent from './BaseEvent';

class CourseCalendarEvent extends BaseEvent {
	static MimeType = `${COMMON_PREFIX}courseware.coursecalendarevent`

	static Fields = {
		...BaseEvent.Fields,
	}
}

export default decorate(CourseCalendarEvent, {with:[model]});
