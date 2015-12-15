import Url from 'url';
import path from 'path';

import {Service} from '../../../CommonSymbols';
import Logger from '../../../logger';

import {HISTORY_LINK} from '../Constants';

import Base from './Collection';

import CollectionSummary from './CollectionSummary';

import AssignmentSummary from '../../../stores/AssignmentSummary';
import GradeBookSummary from '../../../stores/GradeBookSummary';

const logger = Logger.get('assignment:Collection:Instructor');

const keyForUser = userId => `${HISTORY_LINK}:${userId}`;
const HISTORY_LINK_PREFIX = new RegExp('^' + keyForUser(''));

const forUser = (ref, userId) => (
					ref = Url.parse(ref),
					ref.pathname = path.join(path.dirname(ref.pathname), encodeURIComponent(userId)),
					ref.format());

const PRIVATE = new WeakMap();

export default class CollectionInstructorView extends Base {

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
	 * @param  {object} gradebook            GradeBook summary with Links to "GradeBookSummary"
	 *                                       and "GradeBookByAssignment"
	 * @returns {void}
	 */
	constructor (service, parent, assignments, assessments, historyLink, gradebook) {
		super(service, parent, assignments, assessments, historyLink);
		Object.assign(this, {gradebook});
		PRIVATE.set(this, {});
	}


	getLink (rel, ...rest) {
		let link = super.getLink(rel, ...rest);

		if (!link && HISTORY_LINK_PREFIX.test(rel)) {

			let userId = rel.replace(HISTORY_LINK_PREFIX, '');

			return forUser(super.getLink(HISTORY_LINK), userId);
		}

		return link;
	}


	getAssignmentSummary (assignmentId) {
		const data = PRIVATE.get(this);

		if (!data.assignmentSummary) {
			const assignment = this.getAssignment(assignmentId);
			const link = assignment && assignment.getLink('GradeBookByAssignment');

			data.assignmentSummary = link && new AssignmentSummary(
				this[Service],
				this,
				link
			);
		}

		return data.assignmentSummary;
	}


	getStudentSummary (studentUserId) {
		const data = PRIVATE.get(this);

		data.studentSummaries = data.studentSummaries || {};

		if (!data.studentSummaries[studentUserId]) {

			let history = this.fetchLinkParsed(keyForUser(studentUserId));

			data.studentSummaries[studentUserId] = new CollectionSummary(this[Service], this, history);
		}

		return data.studentSummaries[studentUserId];
	}


	getSummary () {
		const data = PRIVATE.get(this);

		if (!data.summary) {
			data.summary = new GradeBookSummary(
				this[Service],
				this,
				this.gradebook.getLink('GradeBookSummary')
			);
		}

		return data.summary;
	}


	getActivity () {
		logger.error('Not Implemented');
		//parent(CourseInstance) -> CourseActivity
	}

}
