import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class CourseProgress extends Base {
	static MimeType = [
		COMMON_PREFIX + 'completion.completioncontextprogress',
	]

	static Fields = {
		...Base.Fields,
		'Enabled':             { type: 'boolean', name: 'enabled'   },
		'IsAvailable':         { type: 'boolean', name: 'available' },
		'IsEnrolled':          { type: 'boolean', name: 'enrolled'  },
		'AbsoluteProgress':    { type: 'number'                     },
		'Completed':           { type: 'boolean'                    },
		'CompletedDate':       { type: 'date'                       },
		'HasProgress':         { type: 'boolean'                    },
		'MaxPossibleProgress': { type: 'number'                     },
		'PercentageProgress':  { type: 'number'                     },
		'CompletedItem': 	   { type: 'model' 						}
	}

	getCompletedDate () {} //implemented by CompletedDate date field.
}
