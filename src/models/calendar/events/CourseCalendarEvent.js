import {model, COMMON_PREFIX} from '../../Registry';

import BaseEvent from './BaseEvent';

export default
@model
class CourseCalendarEvent extends BaseEvent {
	static MimeType = `${COMMON_PREFIX}courseware.coursecalendarevent`

	static Fields = {
		...BaseEvent.Fields,
	}
}
