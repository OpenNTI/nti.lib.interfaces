import {decorate} from '@nti/lib-commons';
import {mixin} from '@nti/lib-decorators';

import {Service} from '../constants';
import Base from '../models/Base';
import Paged from '../mixins/Paged';

import Stream from './Stream';

//@private
const FILTERS = {
	forcredit: 'LegacyEnrollmentStatusForCredit',
	open: 'LegacyEnrollmentStatusOpen'
};


//@private
class RosterRecord extends Base {
	static Fields = {
		...Base.Fields,
		'LegacyEnrollmentStatus': { type: 'string', name: 'enrollmentStatus' },
		'RealEnrollmentStatus':   { type: '*'                                },
		'Username':               { type: '*', name: 'username'              },
		'UserProfile':            { type: 'model', name: 'user'              },
	}


	constructor (service, data) {
		super(service, null, data);
	}


	toString () {
		return `${this.username}: ${this.user.displayName} (${this.user.displayType}) - enrolled: ${this.enrollmentStatus}`;
	}
}

class CourseRosterStream extends Stream {

	constructor (...args) {
		super(...args);
		this.initMixins();
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

export default decorate(CourseRosterStream, {with:[mixin(Paged)]});
