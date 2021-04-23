import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class CourseProgress extends Base {
	static MimeType = [COMMON_PREFIX + 'completion.completioncontextprogress'];

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'Enabled':                { type: 'boolean', name: 'enabled'   },
		'IsAvailable':            { type: 'boolean', name: 'available' },
		'IsEnrolled':             { type: 'boolean', name: 'enrolled'  },
		'AbsoluteProgress':       { type: 'number'                     },
		'Completed':              { type: 'boolean'                    },
		'CompletedDate':          { type: 'date'                       },
		'CountCompleted':         { type: 'number'                     }, // Admin
		'HasProgress':            { type: 'boolean'                    },
		'MaxPossibleProgress':    { type: 'number'                     },
		'PercentageProgress':     { type: 'number'                     },
		'CompletedItem': 	      { type: 'model'                      },
		'UnsuccessfulItemNTIIDs': { type: 'string[]'                   },
	}

	getCompletedDate() {} //implemented by CompletedDate date field.
}

export default decorate(CourseProgress, [model]);
