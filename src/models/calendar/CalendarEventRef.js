import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry';
import Base from '../Base';

class CalendarEventRef extends Base {
	static MimeType = `${COMMON_PREFIX}nticalendareventref`;

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'CalendarEvent':        { type: 'model'  },
		'Target-NTIID':         { type: 'string'}
	}

	get target() {
		return this['Target-NTIID'];
	}

	pointsToId(id) {
		return this.target === id;
	}
}

export default decorate(CalendarEventRef, { with: [model] });
