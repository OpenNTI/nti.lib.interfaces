import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';

export default class AssignmentHistoryItemSummary extends Base {
	static MimeType = [
		COMMON_PREFIX + 'assessment.assignmenthistoryitemsummary',
		COMMON_PREFIX + 'assessment.userscourseassignmenthistoryitemsummary',
	];

	// prettier-ignore
	static Fields = {
		...super.Fields,
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

Registry.register(AssignmentHistoryItemSummary);
