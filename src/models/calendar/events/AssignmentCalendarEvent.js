import { model, COMMON_PREFIX } from '../../Registry';

import BaseEvent from './BaseEvent';

export default
@model
class AssignmentCalendarEvent extends BaseEvent {
	static MimeType = `${COMMON_PREFIX}assessment.assignmentcalendarevent`

	static Fields = {
		...BaseEvent.Fields,
		'total_points':       { type: 'number', name: 'totalPoints' },
		'MaximumTimeAllowed': { type: 'number'  },
		'IsTimedAssignment':  { type: 'boolean' },
		'AssignmentNTIID':    { type: 'string'  },
		'CatalogEntryNTIID':  { type: 'string'  }
	}

	get dueDate () {
		return this.getStartTime();
	}

	getUniqueIdentifier = () => this.AssignmentNTIID + this.CatalogEntryNTIID;
}
