import Stream from './Stream';
import Paged from '../models/mixins/Paged';
import mixin from '../utils/mixin';

//@private
const FILTERS = {
	forcredit: 'ForCredit',
	open: 'Open'
};

export default class AssignmentSummary extends Stream {

	constructor (...args) {
		super(...args);
		mixin(this, Paged);
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
		this.loadPage(1);
	}
}
