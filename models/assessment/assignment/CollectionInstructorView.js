import {Service} from '../../../CommonSymbols';
import Base from './Collection';

import AssignmentSummary from '../../../stores/AssignmentSummary';
import GradeBookSummary from '../../../stores/GradeBookSummary';

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
		//parent(CourseInstance) -> CourseActivity
	}

}
