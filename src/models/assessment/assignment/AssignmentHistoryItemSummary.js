import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';

class AssignmentHistoryItemSummary extends Base {
	static MimeType = [
		COMMON_PREFIX + 'assessment.assignmenthistoryitemsummary',
		COMMON_PREFIX + 'assessment.userscourseassignmenthistoryitemsummary',
	];

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'Grade':                 { type: 'model',  name: 'grade'         },
		'FeedbackCount':         { type: 'number', name: 'feedbackCount' },
		'Metadata':              { type: 'model'                         },
		'SubmissionCreatedTime': { type: 'date'                          },
		'MetadataAttemptItem':   { type: 'model'                         }
	}

	get completed() {
		return this.getSubmissionCreatedTime();
	}
}

export default decorate(AssignmentHistoryItemSummary, { with: [model] });
