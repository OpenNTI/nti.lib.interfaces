import {Service} from '../../../CommonSymbols';
import Logger from '../../../logger';

import {HISTORY_LINK} from '../Constants';

import Base from './Collection';

import CollectionSummary from './CollectionSummary';
import HistoryCollection from './AssignmentHistoryCollection';

const logger = Logger.get('assignment:Collection:Student');

const PRIVATE = new WeakMap();

export default class CollectionStudentView extends Base {

	/**
	 * Build the Assessment Collection.
	 *
	 * @param  {ServiceDocument} service     Service descriptor/interface.
	 * @param  {Model} parent                Parent model.
	 * @param  {object} assignments          Object of keys where each key is an
	 *                                       array of Assignments that are visible
	 *                                       to the current user.
	 * @param  {object} assessments          Object of keys where each key is an
	 *                                       array of Non-Assignment assessments
	 *                                       visible to the current user.
	 * @param  {string} historyLink          URL to fetch assignment histories.
	 * @returns {void}
	 */
	constructor (service, parent, assignments, assessments, historyLink) {
		super(service, parent, assignments, assessments, historyLink);
		PRIVATE.set(this, {});
	}


	onChange (e) {
		super.onChange(e);
		const data = PRIVATE.get(this);
		delete data.history;
	}


	getHistory (refresh = false) {
		const data = PRIVATE.get(this);
		let {history: promise} = data;

		if (!promise || refresh) {
			logger.debug('Loading assignment history for %s...', this.parent().title);
			data.history = promise = this.fetchLinkParsed(HISTORY_LINK)
				.then(x => x instanceof HistoryCollection ? x : Promise.reject('Wrong Type'))
				.catch(() => Promise.reject('No History'));
		}

		return promise;
	}


	getHistoryItem (assignmentId, refresh = false) {
		return this.getHistory(refresh)
			.then(history => history.getItem(assignmentId));
	}


	getStudentSummary () {
		const data = PRIVATE.get(this);

		if (!data.summary) {
			data.summary = new CollectionSummary(this[Service], this, this.getHistory());
		}

		return data.summary;
	}


	getActivity () {
		return this.getHistory()
			.then(history =>
				this.getAssignments()
					.reduce((events, a) => events.concat(
						this.deriveEvents(a,
							history.getItem(a.getID()),
							history.getLastViewed()
						)), [])
					.filter(x => x.date)
					.sort((a, b) => b.date - a.date)
				);

	}
}
