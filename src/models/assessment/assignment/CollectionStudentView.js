import Logger from '@nti/util-logger';

import { Service, ASSESSMENT_HISTORY_LINK } from '../../../constants.js';
import { getPrivate } from '../../../utils/private.js';

import Base from './Collection.js';
import CollectionSummary from './CollectionSummary.js';
import HistoryCollection from './AssignmentHistoryCollection.js';

/** @typedef {import('../../Model.js').default} Model */
/** @typedef {import('../../../stores/Service.js').default} ServiceDocument */

const logger = Logger.get('assignment:Collection:Student');

export default class CollectionStudentView extends Base {
	/**
	 * Build the Assessment Collection.
	 *
	 * @param  {ServiceDocument} service     Service descriptor/interface.
	 * @param  {Model} parent                Parent model.
	 * @param  {Object} assignments          Object of keys where each key is an
	 *                                       array of Assignments that are visible
	 *                                       to the current user.
	 * @param  {Object} assessments          Object of keys where each key is an
	 *                                       array of Non-Assignment assessments
	 *                                       visible to the current user.
	 * @param  {string} historyLink          URL to fetch assignment histories.
	 * @returns {void}
	 */
	constructor(service, parent, assignments, assessments, historyLink) {
		super(service, parent, assignments, assessments, historyLink);
	}

	onChange(e) {
		super.onChange(e);
		const data = getPrivate(this);
		delete data.summary;
	}

	getHistoryItem(assignmentId) {
		return this.getStudentSummary().fetchHistoryFor(assignmentId);
	}

	getStudentSummary() {
		const data = getPrivate(this);

		if (!data.summary) {
			data.summary = new CollectionSummary(
				this[Service],
				this,
				getHistoryFrom(this)
			);
		}

		return data.summary;
	}

	getStudentSummaryWithHistory() {
		const summary = this.getStudentSummary();

		return new Promise((fulfill, reject) => {
			if (summary.loading) {
				const onChange = () => {
					if (!summary.loading) {
						fulfill(summary);
						summary.removeListener('change', onChange);
					}
				};

				summary.addListener('change', onChange);
			} else {
				fulfill(summary);
			}
		});
	}

	getActivity() {
		return getHistoryFrom(this).then(history =>
			Object.assign(
				this.getAssignments()
					.reduce(
						(events, a) =>
							events.concat(
								this.deriveEvents(
									a,
									history.getItem(a.getID()),
									history.getLastViewed()
								)
							),
						[]
					)
					.filter(x => x.date)
					.sort((a, b) => b.date - a.date),
				{
					markSeen: () => history.markSeen(),
				}
			)
		);
	}
}

function getHistoryFrom(inst) {
	logger.debug('Loading assignment history for %s...', inst.parent().title);
	return inst
		.fetchLink(ASSESSMENT_HISTORY_LINK)
		.then(x =>
			x instanceof HistoryCollection ? x : Promise.reject('Wrong Type')
		)
		.catch(() => Promise.reject('No History'));
}
