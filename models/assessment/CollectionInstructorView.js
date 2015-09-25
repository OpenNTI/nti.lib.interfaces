import Base from './Collection';

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
	 * @param  {object} gradebook            GradeBook summery with Links to "GradeBookSummary"
	 *                                       and "GradeBookByAssignment"
	 * @returns {void}
	 */
	constructor (service, parent, assignments, assessments, historyLink, gradebook) {
		super(service, parent, assignments, assessments, historyLink);
		Object.assign(this, {gradebook});
	}

}
