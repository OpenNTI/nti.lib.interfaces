import Base from './Collection';
// import {Service} from '../../CommonSymbols';

import HistoryCollection from './AssignmentHistoryCollection';

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


	onChange (e) {
		super.onChange(e);
		//delete this[HISTORY];
	}


	getHistory (refresh = false) {
		let {[HISTORY]: promise} = this;

		if (!promise || refresh) {
			console.debug('Loading assignment history for %s...', this.parent().title);
			this[HISTORY] = promise = this.fetchLinkParsed('History')
				.then(x => x instanceof HistoryCollection ? x : Promise.reject('Wrong Type'))
				.catch(() => Promise.reject('No History'));
		}

		return promise;
	}


	getHistoryItem (assignmentId, refresh = false) {
		return this.getHistory(refresh)
			.then(history => history.getItem(assignmentId));
	}


	getActivity () {
		return this.getHistory()
			.then(history =>
				this.getAssignments().reduce((events, a) => events.concat(
							this.deriveEvents(a,
								history.getItem(a.getID()),
								history.getLastViewed()
							)
						), []).sort((a, b) => b.date - a.date)
				);

	}
}
