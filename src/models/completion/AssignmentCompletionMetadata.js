import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class AssignmentCompletionMetadata extends Base {
	static MimeType = [
		COMMON_PREFIX + 'assignmentcompletionmetadata',
	]

	static Fields = {
		...Base.Fields,
		'AssignmentNTIID':                     { type: 'string'   },
		'AssignmentTitle':                     { type: 'string'   },
		'CompletionDate':                      { type: 'date'     },
		'CompletionRequiredPassingPercentage': { type: 'number'   },
		'Success':                             { type: 'boolean'  },
		'TotalPoints':                         { type: 'number'   },
		'UserPointsReceived':                  { type: 'number?'   },
	}

	getCompletionDate () { } //implemented by CompletionDate date field.
}
