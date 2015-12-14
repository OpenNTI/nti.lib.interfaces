import Stream from './Stream';
import Paged from '../models/mixins/Paged';
import mixin from '../utils/mixin';

//@private
const FILTERS = {
	forcredit: 'ForCredit',
	open: 'Open'
};

const CATEGORIES = {
	actionable: 'actionable',
	overdue: 'overdue',
	ungraded: 'ungraded'
};

const PRIVATE = new WeakMap();

function setFilter (scope, type = scope.typeFilter, category = scope.categoryFilter) {
	Object.assign(scope.options, {
		filter: [type, category].filter(x => x).join(',')
	});

	delete scope.next;
	scope.loadPage(1);
}

export default class GradeBookSummary extends Stream {

	constructor (...args) {
		super(...args);
		mixin(this, Paged);
		PRIVATE.set(this, {});
	}


	/**
	 * Clears the store, and reloads with a given type filter.
	 *
	 * @param {string} value Either: 'open', 'forCredit' or null to clear the filter.
	 * @returns {void}
	 */
	setTypeFilter (value) {
		const data = PRIVATE.get(this);
		data.typeFilter = FILTERS[(value || '').toLowerCase()];
		setFilter(this);
	}


	/**
	 * Clears the store, and reloads with a given type category.
	 *
	 * @param {string} value Either: 'actionable', 'overdue', 'ungraded' or null to clear the filter.
	 * @returns {void}
	 */
	setCategoryFilter (value) {
		const data = PRIVATE.get(this);
		data.typeCategory = CATEGORIES[(value || '').toLowerCase()];
		setFilter(this);
	}


	get typeFilter () { return PRIVATE.get(this).typeFilter; }
	get categoryFilter () { return PRIVATE.get(this).typeCategory; }
}
