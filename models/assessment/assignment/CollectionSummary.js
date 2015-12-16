import {EventEmitter} from 'events';
import invariant from 'invariant';

import Logger from '../../../logger';
import {SortOrder} from '../../../constants';

const logger = Logger.get('assignment:AssignmentCollectionSummary');

const PRIVATE = new WeakMap();
const initPrivate = (x, o = {}) => PRIVATE.set(x, o);
const getPrivate = x => PRIVATE.get(x);


class AssignmentSummary extends EventEmitter {
	constructor (assignment, history) {
		super();
		initPrivate(this, {assignment, history});
	}

	get title () {
		return getPrivate(this).assignment.title;
	}

	get assignmentId () {
		return getPrivate(this).assignment.getID();
	}

	get assignedDate () {
		return getPrivate(this).assignment.getAssignedDate();
	}

	get dueDate () {
		return getPrivate(this).assignment.getDueDate();
	}

	get late () {
		const {completed, dueDate} = this;
		return !completed
			? dueDate > Date.now()
			: completed > dueDate;
	}

	get overTime () {
		const {assignment: a} = getPrivate(this);
		return a.isOverTime && a.isOverTime();
	}

	get completed () {
		const {history} = getPrivate(this);
		return history && history.getCreatedTime();
	}

	get grade () {
		const {history} = getPrivate(this);
		return history && history.Grade;
	}

	get feedback () {
		const {history} = getPrivate(this);
		return history && history.Feedback;
	}

	get feedbackCount () {
		const {history} = getPrivate(this);
		return history && history.FeedbackCount;
	}
}


/**
 * This class is used by the assignment/Collection.
 * @private
 */
export default class AssignmentCollectionSummary extends EventEmitter {

	/**
	 * Build store.
	 *
	 * @param {Service} service    Instance of the ServiceDocument
	 * @param {Collection} parent Instance of the Assignment Collection. (parent)
	 * @param {Promise} HistoryPromise  A promise that fulfills with an AssignmentHistoryCollection
	 *
	 * @return {void}
	 */
	constructor (service, parent, HistoryPromise) {

		invariant(
			HistoryPromise && typeof HistoryPromise.then === 'function',
			'Must be a promise.');

		super();
		const data = {
			service,
			parent
		};

		initPrivate(this, data);

		HistoryPromise
			.then(history => {
				Object.assign(data, {history});
				this.emit('load', this);
			})
			.catch(error => {
				Object.assign(data, {error});
				this.emit('error', this);
			})
			.then(() => this.emit('change', this));
	}


	get error () { return getPrivate(this).error; }
	get loading () { return !getPrivate(this).history; }


	//@private ... use the iterator or map to access items. Or Array.from if you _need_ an array.
	get items () {
		const data = getPrivate(this);
		const {parent, history, sortOn, sortOrder = SortOrder.ASC} = data;

		if (this.error || this.loading) {
			return [];
		}

		if (!data.cache) {
			data.cache = parent.getAssignments().map(assignment =>
				new AssignmentSummary(assignment, history.getItem(assignment.getID())));

			if (sortOn) {
				logger.info('TODO: sort on: %s, %s', sortOn, sortOrder);
				data.cache.sort(comparatorFor(sortOn, sortOrder));
			}
		}

		return data.cache;
	}


	get length () {
		return this.items.length;
	}


	map (...args) {
		return this.items.map(...args);
	}


	[Symbol.iterator] () {
		return this.items[Symbol.iterator]();
	}


	setSort (sortOn, sortOrder = SortOrder.ASC) {
		const data = getPrivate(this);

		invariant(
			Object.values(SortOrder).includes(sortOrder),
			'sortOrder must be one of SortOrder\'s values.'
		);

		Object.assign(data, {
			sortOn,
			sortOrder
		});

		if (!sortOn) {
			delete data.sortOn;
			delete data.sortOrder;
		}

		delete data.cache;
		this.emit('change', 'sort');
	}


	getSort () {
		const data = getPrivate(this);
		const {sortOn, sortOrder = SortOrder.ASC} = data;
		return {sortOn, sortOrder};
	}

}


function comparatorFor (property, order) {

	const direction = order === SortOrder.ASC ? 1 : -1;
	const LESS = -direction;
	const MORE = direction;
	const SAME = 0;

	return (oA, oB) => {
		const a = oA[property];
		const b = oB[property];
		const tA = typeof a;

		if (a === b) { return SAME; }
		if (!a && b) { return LESS; }
		if (a && !b) { return MORE; }

		if (tA === 'string') {
			let cmp = a.localeCompare(b);
			return cmp === 0 ? SAME : cmp < 0 ? LESS : MORE;
		}

		return a < b ? LESS : MORE;
	};
}
