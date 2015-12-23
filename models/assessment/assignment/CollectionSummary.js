import {EventEmitter} from 'events';
import invariant from 'invariant';

import PageSource from '../../ListBackedPageSource';

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

	getContentId () { return this.assignmentId; }
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
	 * @return {void}
	 */
	constructor (service, parent, HistoryPromise) {

		super();

		this.setMaxListeners(100);

		const data = {
			service,
			parent
		};

		initPrivate(this, data);

		this.setHistory(HistoryPromise);
	}


	//@private
	setHistory (HistoryPromise) {
		const data = getPrivate(this);

		if (data.history) {
			delete data.history;
			this.emit('change', this);
		}

		invariant(
			HistoryPromise && typeof HistoryPromise.then === 'function',
			'Must be a promise.');

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


	getPageSource (pathPrefix = '') {
		return new PageSource(this, pathPrefix);
	}


	getHistoryFor (assignmentId) {
		const {history} = getPrivate(this);
		return history && history.getItem(assignmentId);
	}


	getHistoryForPromise (assignmentId) {
		const store = this;
		return new Promise((fulfill, reject) => {
			const finish = () => {
				store.removeListener('load', finish);
				store.removeListener('error', finish);
				if (store.error) {
					return reject(store.error);
				}

				const item = store.getHistoryFor(assignmentId);
				// if (!item) {
				// 	return reject('No History');
				// }

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

//Sort specs:
// sortOn: ['completed', 'title']
// sortOn: ['title', 'due']
// sortOn: ['assigned', 'due', 'title']
// sortOn: ['due', 'assigned', 'title']
// sortOn: ['score', 'due']


function comparatorFor (property, order) {

	const direction = order === SortOrder.ASC ? 1 : -1;
	const LESS = -direction;
	const MORE = direction;
	const SAME = 0;

	if (property === 'completed') {
		return (oA, oB) => {
			const a = +oA[property];
			const b = +oB[property];
			const aD = +oA.dueDate;
			const bD = +oB.dueDate;

			if (!a) {
				return b ? LESS : aD === bD ? SAME : aD < bD ? LESS : MORE;
			}

			return !b ? MORE : a === b ? SAME : a < b ? LESS : MORE;
		};
	}

	if (property === 'grade') {
		const grade = x => parseFloat((x['grade'] || {}).value, 10) || -1;
		return (oA, oB) => {
			const a = grade(oA);
			const b = grade(oB);
			return a === b ? SAME : a < b ? LESS : MORE;
		};
	}

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
