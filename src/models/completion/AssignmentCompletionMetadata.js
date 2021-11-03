import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

export default class AssignmentCompletionMetadata extends Base {
	static MimeType = [COMMON_PREFIX + 'assignmentcompletionmetadata'];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'AssignmentNTIID':                     { type: 'string'   },
		'AssignmentTitle':                     { type: 'string'   },
		'CompletionDate':                      { type: 'date'     },
		'CompletionRequiredPassingPercentage': { type: 'number'   },
		'Success':                             { type: 'boolean'  },
		'TotalPoints':                         { type: 'number'   },
		'UserPointsReceived':                  { type: 'any'   },
	};

	getNumericUserPointsReceived() {
		return parseFloat(this.UserPointsReceived, 10);
	}

	getCompletionDate() {} //implemented by CompletionDate date field.
}

Registry.register(AssignmentCompletionMetadata);
