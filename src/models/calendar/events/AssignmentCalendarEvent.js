import { model, COMMON_PREFIX } from '../../Registry';

import BaseEvent from './BaseEvent';

export default
@model
class AssignmentCalendarEvent extends BaseEvent {
	static MimeType = `${COMMON_PREFIX}assessment.assignmentcalendarevent`

	static Fields = {
		...BaseEvent.Fields,
		'assignment': { type: 'model' }
	}

	get dueDate () {
		return this.assignment && this.assignment.getDueDate();
	}
}
