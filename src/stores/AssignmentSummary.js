import {decorate} from '@nti/lib-commons';
import {mixin} from '@nti/lib-decorators';

import {getPrivate} from '../utils/private';
import Paged from '../mixins/Paged';

import Stream from './Stream';

//@private
const FILTERS = {
	forcredit: 'ForCredit',
	open: 'Open'
};

const OPPOSITE_FILTER = {
	ForCredit: 'open',
	Open: 'forcredit'
};

class AssignmentSummary extends Stream {

	constructor (...args) {
		super(...args);
		this.initMixins();
	}

	get parseList () {
		const p = getPrivate(this);

		if (!p.parseListFn) {
			this.parentItems = true;
			p.parseListFn = super.parseList;
			delete this.parentItems;
		}

		return p.parseListFn;
	}


	applyBatch (input) {
		const data = getPrivate(this);
		super.applyBatch(input);

		const {filter} = this.options;
		const {EnrollmentScope, ItemCount} = input;

		if (!filter && ItemCount === 0) {
			return this.retryBatch(() => this.setFilter(OPPOSITE_FILTER[EnrollmentScope]));
		}

		if (EnrollmentScope && filter !== EnrollmentScope) {
			this.options.filter = EnrollmentScope;
		}

		// EnrollmentScope: "ForCredit"
		// BatchPage: 1
		// ItemCount: 1
		// TotalItemCount: 1

		data.total = input.TotalItemCount;
	}


	get total () { return getPrivate(this).total || this.length; }
	getTotal () { return this.total; } //expected by Paged mixin

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

	get filter () { return this.options.filter; }
	getFilter () { return this.filter; }
}

export default decorate(AssignmentSummary, {with:[mixin(Paged)]});
