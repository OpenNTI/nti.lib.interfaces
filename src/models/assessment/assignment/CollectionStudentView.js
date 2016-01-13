import {Service} from '../../../constants';
import Logger from 'nti-util-logger';

import {HISTORY_LINK} from '../Constants';

import Base from './Collection';

import CollectionSummary from './CollectionSummary';
import HistoryCollection from './AssignmentHistoryCollection';

const logger = Logger.get('assignment:Collection:Student');

const PRIVATE = new WeakMap();
const initPrivate = (x, o = {}) => PRIVATE.set(x, o);
const getPrivate = x => PRIVATE.get(x);

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
		initPrivate(this);
	}


	onChange (e) {
		super.onChange(e);
		const data = getPrivate(this);
		delete data.summary;
	}


	getHistoryItem (assignmentId) {
		return this.getStudentSummary().getHistoryForPromise(assignmentId);
	}


	getStudentSummary () {
		const data = getPrivate(this);

		if (!data.summary) {
			data.summary = new CollectionSummary(this[Service], this, getHistoryFrom(this));
		}

		return data.summary;
	}


	getActivity () {
		return getHistoryFrom(this)
			.then(history =>
				Object.assign(this.getAssignments()
					.reduce((events, a) => events.concat(
						this.deriveEvents(a,
							history.getItem(a.getID()),
							history.getLastViewed()
						)), [])
					.filter(x => x.date)
					.sort((a, b) => b.date - a.date),
					{
						markSeen: () => history.markSeen()
					})
				);

	}
}


function getHistoryFrom (inst) {
	logger.debug('Loading assignment history for %s...', inst.parent().title);
	return inst.fetchLinkParsed(HISTORY_LINK)
		.then(x => x instanceof HistoryCollection ? x : Promise.reject('Wrong Type'))
		.catch(() => Promise.reject('No History'));
}
