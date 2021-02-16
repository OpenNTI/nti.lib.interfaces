import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry';
import Base from '../Base';

class CourseCalendar extends Base {
	static MimeType = `${COMMON_PREFIX}courseware.coursecalendar`;

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'title':       	{ type: 'string' },
		'CatalogEntry': { type: 'model'  }
	}
}

export default decorate(CourseCalendar, { with: [model] });
