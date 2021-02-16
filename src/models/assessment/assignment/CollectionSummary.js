import EventEmitter from 'events';

import invariant from 'invariant';
import { Paging } from '@nti/lib-commons';

import { initPrivate, getPrivate } from '../../../utils/private';
import { SortOrder } from '../../../constants';

const PageSource = Paging.ListBackedPageSource;

function clearCache(x) {
	const data = getPrivate(x);
	if (data.cache) {
		data.cache.forEach(i => i.removeAllListeners());
		delete data.cache;
	}
}

class AssignmentSummary extends EventEmitter {
	constructor(assignment, history, username) {
		super();
		initPrivate(this, { assignment, history, username });
		if (history) {
			history.on('change', (...args) => this.emit('change', ...args));
		}
	}

	get historyItem() {
		const data = getPrivate(this);

		return (
			data.history &&
			data.history.getMostRecentHistoryItem &&
			data.history.getMostRecentHistoryItem()
		);
	}

	get username() {
		return getPrivate(this).username;
	}

	get title() {
		return getPrivate(this).assignment.title;
	}

	get assignmentId() {
		return getPrivate(this).assignment.getID();
	}

	get assignedDate() {
		return getPrivate(this).assignment.getAssignedDate();
	}

	get dueDate() {
		return getPrivate(this).assignment.getDueDate();
	}

	get passingScore() {
		return getPrivate(this).assignment.passingScore;
	}

	get totalPoints() {
		return getPrivate(this).assignment.totalPoints;
	}

	get late() {
		const { completed, dueDate } = this;
		return !completed ? dueDate > Date.now() : completed > dueDate;
	}

	get overTime() {
		const { assignment: a } = getPrivate(this);
		return a.isOverTime && a.isOverTime();
	}

	get failed() {
		const { assignment } = getPrivate(this);
		const complete = assignment?.CompletedItem;
		return complete?.Success === false;
	}

	get completed() {
		return this.historyItem?.getCreatedTime();
	}

	get grade() {
		return this.historyItem?.grade;
	}

	get feedback() {
		return this.historyItem?.Feedback;
	}

	get feedbackCount() {
		return this.historyItem?.feedbackCount;
	}

	get isCreatedByAppUser() {
		return this.historyItem.isCreatedByAppUser;
	}

	getContentId() {
		return this.assignmentId;
	}
	// getID () { return this.assignmentId; }
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
	 * @returns {void}
	 */
	constructor(service, parent, HistoryPromise) {
		super();

		this.setMaxListeners(100);

		const data = {
			service,
			parent,
			sortOn: 'title',
			sortOrder: SortOrder.ASC,
		};

		initPrivate(this, data);

		this.setHistory(HistoryPromise);
	}

	//@private
	setHistory(HistoryPromise) {
		const data = getPrivate(this);

		if (data.history) {
			delete data.history;
			this.emit('change', this);
		}

		invariant(
			HistoryPromise && typeof HistoryPromise.then === 'function',
			'Must be a promise.'
		);

		HistoryPromise.catch(error =>
			error.status === 404 || typeof error === 'string'
				? null
				: Promise.reject(
						Object.assign(new Error(error.statusText), error)
				  )
		)
			.then(history => {
				// AvailableAssignmentNTIIDs
				Object.assign(data, { history });
				this.emit('load', this);
			})
			.catch(error => {
				Object.assign(data, { error });
				try {
					this.emit('error', this);
				} catch (e) {
					//don't care
				}
			})
			.then(() => this.emit('change', this));
	}

	get error() {
		return getPrivate(this).error;
	}
	get loading() {
		return !getPrivate(this).history;
	}

	getPageSource(pathPrefix = '') {
		return new PageSource(this, pathPrefix);
	}

	setHistoryItem(assignmentId, historyItem) {
		const { error, history } = getPrivate(this);
		if (error || !history) {
			//no history means either: there is an inflight request, or there was an error.
			//If error, drop and return.
			//
			//TODO: There is an edge case: Request in flight, no error. (the response
			// from in flight request may not have this history item)
			return;
		}

		clearCache(this);

		history.setItem(assignmentId, historyItem);

		this.emit('change', 'new-history');
	}

	getHistoryFor(assignmentId) {
		const { history } = getPrivate(this);
		const container = history && history.getItem(assignmentId);
		return container;
	}

	fetchHistoryFor(assignmentId) {
		const store = this;
		return new Promise((fulfill, reject) => {
			const finish = () => {
				store.removeListener('load', finish);
				store.removeListener('error', finish);
				if (store.error) {
					return reject(store.error);
				}

				const item = store.getHistoryFor(assignmentId);
				fulfill(item);
			};

			if (store.loading) {
				store.on('load', finish);
				store.on('error', finish);
				return;
			}

			finish();
		});
	}

	//@private ... use the iterator or map to access items. Or Array.from if you _need_ an array.
	get items() {
		const data = getPrivate(this);
		const { parent, history, sortOn, sortOrder = SortOrder.ASC } = data;

		if (this.error || this.loading) {
			return [];
		}

		if (!data.cache) {
			data.cache = parent
				.getAssignments()
				.filter(a => history.isRelevantFor(a.getID()))
				.map(
					assignment =>
						new AssignmentSummary(
							assignment,
							history.getItem(assignment.getID()),
							history.creator
						)
				);

			if (sortOn) {
				data.cache.sort(comparator(sortOn, sortOrder));
			}
		}

		return data.cache;
	}

	get length() {
		return this.items.length;
	}

	map(...args) {
		return this.items.map(...args);
	}

	[Symbol.iterator]() {
		return this.items[Symbol.iterator]();
	}

	setSort(sortOn, sortOrder = SortOrder.ASC) {
		const data = getPrivate(this);

		invariant(
			Object.values(SortOrder).includes(sortOrder),
			"sortOrder must be one of SortOrder's values."
		);

		Object.assign(data, {
			sortOn,
			sortOrder,
		});

		if (!sortOn) {
			delete data.sortOn;
			delete data.sortOrder;
		}

		clearCache(this);
		this.emit('change', 'sort');
	}

	getSort() {
		const data = getPrivate(this);
		const { sortOn, sortOrder = SortOrder.ASC } = data;
		return { sortOn, sortOrder };
	}
}

//Sort specs:
const SORT_SPECS = {
	completed: ['completed', 'title'],
	title: ['title', 'due'],
	assigned: ['assigned', 'due', 'title'],
	due: ['due', 'assigned', 'title'],
	grade: ['completed:bool', 'grade', 'due', 'title'],
};

function comparator(property, order) {
	const spec = (SORT_SPECS[property] || [property]).map(p =>
		comparatorFn(p, order)
	);

	return (...args) => spec.reduce((r, fn) => (r !== 0 ? r : fn(...args)), 0);
}

function comparatorFn(property, order) {
	if (Array.isArray(property)) {
		[property, order] = property;
	}

	const direction = order === SortOrder.ASC ? 1 : -1;
	const LESS_THAN = -direction;
	const GREATER_THAN = direction;
	const SAME = 0;

	function grade(x) {
		let g = x.grade == null ? x.grade : x.grade.value || void 0;
		let v = parseFloat(g, 10);
		return g && (isNaN(v) ? g : v);
	}

	if (property === 'completed') {
		return (oA, oB) => {
			const a = +oA.completed;
			const b = +oB.completed;
			const aD = +oA.dueDate;
			const bD = +oB.dueDate;

			if (!a) {
				return b
					? LESS_THAN
					: aD === bD
					? SAME
					: aD < bD
					? LESS_THAN
					: GREATER_THAN;
			}

			return !b
				? GREATER_THAN
				: a === b
				? SAME
				: a < b
				? LESS_THAN
				: GREATER_THAN;
		};
	}

	if (property === 'completed:bool') {
		return (oA, oB) => {
			const a = !!oA.completed;
			const b = !!oB.completed;
			return a === b ? SAME : !a ? LESS_THAN : GREATER_THAN;
		};
	}

	if (property === 'grade') {
		return (oA, oB) => {
			const a = grade(oA);
			const b = grade(oB);

			const tA = typeof a;
			const tB = typeof b;

			if (a == null && b != null) {
				return LESS_THAN;
			}

			if (a != null && b == null) {
				return GREATER_THAN;
			}

			if (tA === 'string' && tB === 'string') {
				let c = -a.localeCompare(b); //Grade "string compare" inverts alphabetical order
				return c === 0 ? SAME : c < 0 ? LESS_THAN : GREATER_THAN;
			}

			if (tA === 'string' && tB !== 'string') {
				return LESS_THAN;
			}

			if (tA !== 'string' && tB === 'string') {
				return GREATER_THAN;
			}

			return a === b ? SAME : a < b ? LESS_THAN : GREATER_THAN;
		};
	}

	return (oA, oB) => {
		const a = oA[property];
		const b = oB[property];
		const tA = typeof a;

		if (a === b) {
			return SAME;
		}
		if (!a && b) {
			return LESS_THAN;
		}
		if (a && !b) {
			return GREATER_THAN;
		}

		if (tA === 'string') {
			let cmp = a.localeCompare(b);
			return cmp === 0 ? SAME : cmp < 0 ? LESS_THAN : GREATER_THAN;
		}

		return a < b ? LESS_THAN : GREATER_THAN;
	};
}
