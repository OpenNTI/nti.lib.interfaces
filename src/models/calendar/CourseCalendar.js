import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class CourseCalendar extends Base {
	static MimeType = `${COMMON_PREFIX}courseware.coursecalendar`;

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'title':       	{ type: 'string' },
		'CatalogEntry': { type: 'model'  }
	}
}

export default decorate(CourseCalendar, [model]);
