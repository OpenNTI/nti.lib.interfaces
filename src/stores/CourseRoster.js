import { Service } from '../constants.js';
import Base from '../models/Base.js';
import Paged from '../mixins/Paged.js';

import Stream from './Stream.js';

//@private
const FILTERS = {
	forcredit: 'LegacyEnrollmentStatusForCredit',
	open: 'LegacyEnrollmentStatusOpen',
};

//@private
class RosterRecord extends Base {
	// prettier-ignore
	static Fields = {
		...super.Fields,
		'LegacyEnrollmentStatus': { type: 'string', name: 'enrollmentStatus' },
		'RealEnrollmentStatus':   { type: '*'                                },
		'Username':               { type: '*', name: 'username'              },
		'UserProfile':            { type: 'model', name: 'user'              },
	}

	constructor(service, data) {
		super(service, null, data);
	}

	toString() {
		return `${this.username}: ${this.user.displayName} (${this.user.displayType}) - enrolled: ${this.enrollmentStatus}`;
	}
}

export default class CourseRosterStream extends Paged(Stream) {
	parseList(items) {
		return items
			.map(x => x && new RosterRecord(this[Service], x))
			.filter(x => x);
	}

	/**
	 * Clears the store, and reloads with a given filter.
	 *
	 * @param {string} filter Either: 'open', 'forCredit' or null to clear the filter.
	 * @returns {void}
	 */
	setFilter(filter) {
		Object.assign(this.options, {
			batchStart: 0,
			filter: FILTERS[(filter || '').toLowerCase()],
		});

		delete this.next;
		this.nextBatch();
	}
}
