import {mixin} from '@nti/lib-decorators';
import Logger from '@nti/util-logger';

import Paged from '../mixins/Paged';

import Stream from './Stream';

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
const initPrivate = (x, o = {}) => PRIVATE.set(x, o);
const getPrivate = x => PRIVATE.get(x);

function setFilter (instance, scope = instance.scopeFilter, category = instance.categoryFilter) {
	const {options} = instance;

	options.filter = [scope, category].filter(x => x).join(',');
	if (options.filter.length === 0) {
		delete options.filter;
	}

	delete instance.next;
	instance.loadPage(1);
}

export default
@mixin(Paged)
class GradeBookSummary extends Stream {

	constructor (service, owner, href, options, ...args) {
		super(service, owner, href, options, ...args);
		initPrivate(this);
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

		const {EnrollmentScope, AvailableFinalGrade} = input;
		// AvailableFinalGrade: true
		// EnrollmentScope: "ForCredit"
		// BatchPage: 1
		// ItemCount: 1
		// TotalItemCount: 1

		if (EnrollmentScope && data.scopeFilter !== EnrollmentScope) {
			if (data.scopeFilter) { //don't warn if not initialized
				logger.warn('EnrollmentScope resolved to a different value than requested.');
			}

			data.scopeFilter = EnrollmentScope;
		}

		data.hasFinalGrade = Boolean(AvailableFinalGrade);


		data.total = input.TotalItemCount;
	}


	get total () { return PRIVATE.get(this).total || this.length; }
	getTotal () { return this.total; } //expected by Paged mixin


	get hasFinalGrade () { return PRIVATE.get(this).hasFinalGrade; }


	/**
	 * Clears the store, and reloads with a given scope.
	 *
	 * @param {string} scope Either: 'Open' or 'ForCredit'.
	 * @returns {void}
	 */
	setScopeFilter (scope) {
		const data = getPrivate(this);
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
		const data = getPrivate(this);
		data.categoryFilter = CATEGORIES[(value || '').toLowerCase()];
		setFilter(this);
	}


	get scopeFilter () { return getPrivate(this).scopeFilter; }
	get categoryFilter () { return getPrivate(this).categoryFilter; }
}
