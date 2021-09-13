import Completable from '../../mixins/Completable.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

/** @typedef {import('./events/BaseEvent').BaseEvent} BaseEvent */

export default class CalendarEventRef extends Completable(Base) {
	static MimeType = `${COMMON_PREFIX}nticalendareventref`;

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'CalendarEvent':        { type: 'model'  },
		'Target-NTIID':         { type: 'string' },
	}

	__isSocketChangeEventApplicable(change) {
		return (
			super.__isSocketChangeEventApplicable?.(change) ||
			this.CalendarEvent?.getID() === change.Item.ItemNTIID
		);
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
