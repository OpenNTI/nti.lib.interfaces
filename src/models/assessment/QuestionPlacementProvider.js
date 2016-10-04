import {defineProtected} from 'nti-commons';

export default class QuestionPlacementProvider {
	/**
	 * @param {Instance} scope - the course instance scope.
	 * @param {Question} item - the question instance to place.
	 * @param {string[]} [accepts] - optional list of mimetypes to limit the output.
	 */
	constructor (scope, item, accepts) {
		Object.defineProperties(this, {

			...defineProtected({
				scope,
				item,
				filter: accepts ? x => accepts.includes(x.MimeType) : null
			})

		});
	}


	/**
	 * @returns {Promise} Fulfills with an array of items that the given
	 *                    "item" (Question) can be placed. Rejects on errors.
	 */
	getItems () {
		//For now, Questions can be placed in QuestionSets... assignments reference questionsets.
		//This should perform the appropriate lookups...

		return Promise.all([
			this.getQuestionSets(),
			this.getAssignments()
		])
			.then(([questionSets, assignments]) => {
				//merge (dedupe)

				return [...questionSets, ...assignments];
			})
			.then(items => this.filter ? this.filter(items) : items);
	}


	//Get a list of questionSets from the scope.
	getQuestionSets () {}

	//Get a list of assignments from the scope.
	getAssignments () {}

}
