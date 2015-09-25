import Base from './Collection';
import {Service} from '../../CommonSymbols';

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
		super(service, parent, assignments, assessments);
		Object.assign(this, {historyLink});
	}



	getHistory () {
		this[Service].get(this.historyLink)
			.then(a => console.log(a));
	}


	getHistoryItem (assignmentId) {

	}
}
