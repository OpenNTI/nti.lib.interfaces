import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class CalendarEventRef extends Base {
	static MimeType = `${COMMON_PREFIX}nticalendareventref`;

	// prettier-ignore
	static Fields = {
		...super.Fields,
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

Registry.register(CalendarEventRef);
