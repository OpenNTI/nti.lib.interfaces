import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry.js';

import BaseEvent from './BaseEvent.js';

class AssignmentCalendarEvent extends BaseEvent {
	static MimeType = `${COMMON_PREFIX}assessment.assignmentcalendarevent`;

	// prettier-ignore
	static Fields = {
		...BaseEvent.Fields,
		'total_points':       { type: 'number', name: 'totalPoints' },
		'MaximumTimeAllowed': { type: 'number'  },
		'IsTimedAssignment':  { type: 'boolean' },
		'AssignmentNTIID':    { type: 'string'  },
		'CatalogEntryNTIID':  { type: 'string'  }
	}

	get dueDate() {
		return this.getStartTime();
	}

	getUniqueIdentifier = () => this.AssignmentNTIID + this.CatalogEntryNTIID;
}

export default decorate(AssignmentCalendarEvent, [model]);
