import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class CourseProgress extends Base {
	static MimeType = [
		COMMON_PREFIX + 'completion.progres',
	]

	static Fields = {
		...Base.Fields,
		'Enabled':             { type: 'boolean', name: 'enabled'   },
		'IsAvailable':         { type: 'boolean', name: 'available' },
		'IsEnrolled':          { type: 'boolean', name: 'enrolled'  },
		'AbsoluteProgress':    { type: 'int'                        },
		'Completed':           { type: 'bool'                       },
		'CompletedDate':       { type: 'string'                     },
		'HasProgress':         { type: 'bool'                       },
		'MaxPossibleProgress': { type: 'int'                        }
	}

}
