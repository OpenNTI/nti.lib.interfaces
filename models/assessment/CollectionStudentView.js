import Base from './Collection';
// import {Service} from '../../CommonSymbols';

import HistoryItem from './AssignmentHistoryItem';

const HISTORY = Symbol();

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
	}



	getHistory (refresh = false) {
		const {reject} = Promise;
		let {[HISTORY]: promise} = this;

		if (!promise || refresh) {
			console.debug('Loading assignment history for %s...', this.parent().title);
			this[HISTORY] = promise = this.fetchLinkParsed('History')
				.then(x => x instanceof HistoryItem ? x : reject('Wrong Type'))
				.catch(() => reject('No History'));
		}

		return promise;
	}


	getHistoryItem (assignmentId, refresh = false) {
		return this.getHistory(refresh)
			.then(history => history.getItem(assignmentId));
	}
}
