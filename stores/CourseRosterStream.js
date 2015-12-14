import Base from '../models/Base';
import Stream from './Stream';

import {Service, Parser as parse} from '../CommonSymbols';

const RENAME = Symbol.for('TakeOver');

//@private
const FILTERS = {
	forCredit: 'LegacyEnrollmentStatusForCredit',
	open: 'LegacyEnrollmentStatusOpen'
};


//@private
class RosterRecord extends Base {
	constructor (service, data) {
		super(service, null, data);

		this[parse]('UserProfile');
		this[RENAME]('LegacyEnrollmentStatus', 'enrollmentStatus');
		// this[RENAME]('RealEnrollmentStatus', '...');
		this[RENAME]('Username', 'username');
		this[RENAME]('UserProfile', 'user');
	}

	toString () {
		return `${this.username}: ${this.user.displayName} (${this.user.displayType}) - enrolled: ${this.enrollmentStatus}`;
	}
}

export default class CourseRosterStream extends Stream {

	constructor (...args) {
		super(...args);
	}


	get parseListFn () {
		return items => items.map(x => x && new RosterRecord(this[Service], x)).filter(x => x);
	}


	/**
	 * Clears the store, and reloads with a given filter.
	 *
	 * @param {string} filter Either: 'open', 'forCredit' or null to clear the filter.
	 * @returns {void}
	 */
	setFilter (filter) {

		Object.assign(this.options, {
			batchStart: 0,
			filter: FILTERS[filter]
		});

		delete this.next;
		this.nextBatch();
	}
}
