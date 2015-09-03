import Base from './Collection';

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
	 * @param  {array} tables                Tables of Contents
	 * @param  {string} historyLink          URL to fetch assignment histories.
	 * @returns {void}
	 */
	constructor (service, parent, assignments, assessments, tables, historyLink) {
		super(service, parent, assignments, assessments, tables);
		Object.assign(this, {historyLink});
	}

}
