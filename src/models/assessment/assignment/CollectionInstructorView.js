import Url from 'url';
import path from 'path';

import {
	Service,
	ASSESSMENT_HISTORY_LINK
} from '../../../constants';
// import Logger from 'nti-util-logger';


import Base from './Collection';

import CollectionSummary from './CollectionSummary';
import ActivityStore from './AssignmentActivityStore';

import AssignmentSummary from '../../../stores/AssignmentSummary';
import GradeBookSummary from '../../../stores/GradeBookSummary';

// const logger = Logger.get('assignment:Collection:Instructor');

const keyForUser = userId => userId != null ? `${ASSESSMENT_HISTORY_LINK}:${userId}` : ASSESSMENT_HISTORY_LINK;
const ASSESSMENT_HISTORY_LINK_PREFIX = new RegExp('^' + keyForUser(''));

const forUser = (ref, userId) => (
					ref = Url.parse(ref),
					ref.pathname = path.join(path.dirname(ref.pathname), encodeURIComponent(userId)),
					ref.format());

const PRIVATE = new WeakMap();
const initPrivate = (x, o = {}) => PRIVATE.set(x, o);
const getPrivate = x => PRIVATE.get(x);

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
		initPrivate(this);
	}


	getLink (rel, ...rest) {
		let link = super.getLink(rel, ...rest);

		if (!link && ASSESSMENT_HISTORY_LINK_PREFIX.test(rel)) {

			let userId = rel.replace(ASSESSMENT_HISTORY_LINK_PREFIX, '');

			return forUser(super.getLink(ASSESSMENT_HISTORY_LINK), userId);
		}

		return link;
	}


	getAssignmentSummary (assignmentId, createIfDoesNotExist = true) {
		const data = getPrivate(this);

		data.assignmentSummary = data.assignmentSummary || {};

		if (!data.assignmentSummary[assignmentId] && createIfDoesNotExist) {
			const assignment = this.getAssignment(assignmentId);
			const link = assignment && assignment.getLink('GradeBookByAssignment');

			data.assignmentSummary[assignmentId] = link && new AssignmentSummary(
				this[Service],
				this,
				link
			);
		}

		return data.assignmentSummary[assignmentId];
	}


	getStudentSummary (studentUserId, createIfDoesNotExist = true) {
		const data = getPrivate(this);

		data.studentSummaries = data.studentSummaries || {};

		if (!data.studentSummaries[studentUserId] && createIfDoesNotExist) {

			let history = this.fetchLinkParsed(keyForUser(studentUserId));

			data.studentSummaries[studentUserId] = new CollectionSummary(this[Service], this, history);
		}

		return data.studentSummaries[studentUserId];
	}


	getSummary () {
		const data = getPrivate(this);

		if (!data.summary) {
			data.summary = new GradeBookSummary(
				this[Service],
				this,
				this.gradebook.getLink('GradeBookSummary')
			);
		}
		else if(data.summary.dirty) {
			data.summary.reloadPage();
		}

		return data.summary;
	}


	markSummaryDirty () {
		const data = getPrivate(this);
		if (data.summary) {
			data.summary.dirty = true;
		}
	}


	getHistoryItem (assignmentId, studentUserId) {
		if (!this.getAssignment(assignmentId)) {
			return Promise.reject('Assignment Not Found.');
		}
		return this.getStudentSummary(studentUserId).getHistoryForPromise(assignmentId);
	}


	getActivity () {
		const p = getPrivate(this);
		if (!p.activityStore) {

			const baseActivity = (lastViewed) => this.getAssignments()
						.reduce((events, a) => events.concat(this.deriveEvents(a, null, lastViewed)), [])
						.filter(x => x.date);

			//parent(CourseInstance) -> CourseActivity
			const href = this.parent().getLink('CourseActivity');
			if (!href) {
				return Promise.reject('No Link');
			}

			p.activityStore = new ActivityStore(this[Service], this, href, baseActivity);
		}

		return Promise.resolve(p.activityStore);
	}


	setGrade (gradeOrAssignmentId, Username, value, letter) {
		//const data = getPrivate(this);
		const getGrade = thing => typeof thing === 'object' ? thing : {
			AssignmentId: thing, Username,
			href: this.gradebook.getLink('SetGrade'),
			IsExcused: false,
			MimeType: 'application/vnd.nextthought.grade',
			value: `${value} ${letter || '-'}`
		};

		const grade = getGrade(gradeOrAssignmentId);

		this.markSummaryDirty();

		//existing grade
		if (grade.change) {
			return grade.change(value, letter);
		}

		//new grade
		return this[Service].post(grade.href, grade)
			.then(o => o && this[Service].getObject(o, {parent: this}))
			.then(historyItem => {
				if (!historyItem) { return; }
				const {AssignmentId: assignmentId} = grade;

				const as = this.getAssignmentSummary(assignmentId, false);
				if (as) {
					const record = as.find(x => x.username === Username);
					if (record) {
						record.HistoryItemSummary = historyItem;
						record.onChange('HistoryItemSummary');
					}
				}

				const us = this.getStudentSummary(Username, false);
				if (us) {
					us.setHistoryItem(assignmentId, historyItem);
				}

				this.emit('new-grade', assignmentId);
				this.onChange('new-grade', this);
			});
	}


	resetAssignment (assignmentId, username) {
		if (!assignmentId || !username) {
			throw new Error('Invalid Arguments');
		}

		return this.getHistoryItem(assignmentId, username)
			.then(history => history && history.delete())
			.then(() => {

				const as = this.getAssignmentSummary(assignmentId, false);
				if (as) {
					const record = as.find(x => x.username === username);
					if (record) {
						delete record.HistoryItemSummary;
						record.onChange('HistoryItemSummary');
					}
				}

				const us = this.getStudentSummary(username, false);
				if (us) {
					us.setHistoryItem(assignmentId, null);
				}

				this.markSummaryDirty();
				this.emit('reset-grade', assignmentId);
				this.onChange('reset-grade', this);
			});
	}
}
