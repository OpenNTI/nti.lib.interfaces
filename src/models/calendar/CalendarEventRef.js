import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

/** @typedef {import('./events/BaseEvent').BaseEvent} BaseEvent */

export default class CalendarEventRef extends Base {
	static MimeType = `${COMMON_PREFIX}nticalendareventref`;

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'CalendarEvent':        { type: 'model'  },
		'Target-NTIID':         { type: 'string' },
	}

	/**
	 * @property {BaseEvent} CalendarEvent
	 */

	/** @returns {string} */
	get target() {
		return this['Target-NTIID'];
	}

	/**
	 * @param {string} id
	 * @returns {boolean}
	 */
	pointsToId(id) {
		return this.target === id;
	}
}

Registry.register(CalendarEventRef);
