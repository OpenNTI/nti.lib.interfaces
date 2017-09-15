import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
class AssignmentHistoryItemSummary extends Base {
	static MimeType = [
		COMMON_PREFIX + 'assessment.assignmenthistoryitemsummary',
		COMMON_PREFIX + 'assessment.userscourseassignmenthistoryitemsummary',
	]

	static Fields = {
		...Base.Fields,
		'Grade':                 { type: 'model',  name: 'grade'         },
		'FeedbackCount':         { type: 'number', name: 'feedbackCount' },
		'Metadata':              { type: 'model'                         },
		'SubmissionCreatedTime': { type: 'date'                          },
	}


	get completed () {
		return this.getSubmissionCreatedTime();
	}
}
