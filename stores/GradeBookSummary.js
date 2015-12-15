import Stream from './Stream';
import Paged from '../models/mixins/Paged';
import mixin from '../utils/mixin';

import Logger from '../logger';

const logger = Logger.get('store:GradeBookSummary');

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

function setFilter (instance, scope = scope.scopeFilter, category = scope.categoryFilter) {
	const {options} = instance;

	options.filter = [scope, category].filter(x => x).join(',');
	if (options.filter.length === 0) {
		delete options.filter;
	}

	delete instance.next;
	instance.loadPage(1);
}

export default class GradeBookSummary extends Stream {

	constructor (service, owner, href, options, ...args) {
		super(service, owner, href, options, ...args);
		mixin(this, Paged);
		PRIVATE.set(this, {});
	}


	applyBatch (input) {
		const data = PRIVATE.get(this);
		super.applyBatch(input);

		const {EnrollmentScope} = input;
		if (EnrollmentScope && data.scopeFilter !== EnrollmentScope) {
			if (data.scopeFilter) { //don't warn if not initialized
				logger.warn('EnrollmentScope resolved to a different value than requested.');
			}

			data.scopeFilter = EnrollmentScope;
		}

		// BatchPage: 1
		// EnrollmentScope: "ForCredit"
		// ItemCount: 1
		// TotalItemCount: 1

	}


	/**
	 * Clears the store, and reloads with a given scope.
	 *
	 * @param {string} scope Either: 'Open' or 'ForCredit'.
	 * @returns {void}
	 */
	setScopeFilter (scope) {
		const data = PRIVATE.get(this);
		const value = FILTERS[(scope || '').toLowerCase()];
		if (!value) {
			throw new Error('Scope must be Open or ForCredit');
		}
		data.scopeFilter = value;
		setFilter(this);
	}


	/**
	 * Clears the store, and reloads with a given category.
	 *
	 * @param {string} value Either: 'actionable', 'overdue', 'ungraded' or null to clear the filter.
	 * @returns {void}
	 */
	setCategoryFilter (value) {
		const data = PRIVATE.get(this);
		data.categoryFilter = CATEGORIES[(value || '').toLowerCase()];
		setFilter(this);
	}


	get scopeFilter () { return PRIVATE.get(this).scopeFilter; }
	get categoryFilter () { return PRIVATE.get(this).categoryFilter; }
}
