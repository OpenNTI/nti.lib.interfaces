import {EventEmitter} from 'events';
import invariant from 'invariant';

const PRIVATE = new WeakMap();
const initPrivate = (x, o = {}) => PRIVATE.set(x, o);
const getPrivate = x => PRIVATE.get(x);


class AssignmentSummary extends EventEmitter {
	constructor (assignment, history) {
		super();
		initPrivate(this, {assignment, history});
		console.log(this);
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


	get items () {
		const data = getPrivate(this);
		const {parent, history} = data;

		if (this.error || this.loading) {
			return [];
		}

		if (!data.cache) {
			data.cache = parent.getAssignments().map(assignment =>
				new AssignmentSummary(assignment, history.getItem(assignment.getID())));
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

}
