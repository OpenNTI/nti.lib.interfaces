import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

export default class CourseCalendar extends Base {
	static MimeType = `${COMMON_PREFIX}courseware.coursecalendar`;

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'title':       	{ type: 'string' },
		'CatalogEntry': { type: 'model'  }
	};
}

Registry.register(CourseCalendar);
