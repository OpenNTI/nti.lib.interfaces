import {mixin} from 'nti-commons';

import {Service, Parser as parse} from '../constants';
import Base from '../models/Base';
import Paged from '../mixins/Paged';

import Stream from './Stream';

const RENAME = Symbol.for('TakeOver');

//@private
const FILTERS = {
	forcredit: 'LegacyEnrollmentStatusForCredit',
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
		mixin(this, Paged);
	}


	parseList (items) {
		return items.map(x => x && new RosterRecord(this[Service], x)).filter(x => x);
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
			filter: FILTERS[(filter || '').toLowerCase()]
		});

		delete this.next;
		this.nextBatch();
	}
}
