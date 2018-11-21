import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class CourseCalendarEvent extends Base {
	static MimeType = `${COMMON_PREFIX}courseware.coursecalendarevent`

	static Fields = {
		...Base.Fields,
		'start_time':  { type: 'date', name: 'startTime' },
		'end_time':    { type: 'date', name: 'endTime'   },
		'description': { type: 'string'                  },
		'icon':        { type: 'string'                  },
		'location':    { type: 'string'                  },
		'title':       { type: 'string'                  },
	}
}
