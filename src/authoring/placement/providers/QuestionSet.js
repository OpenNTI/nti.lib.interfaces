import {defineProtected} from '@nti/lib-commons';

export default class QuestionSetPlacementProvider {
	/**
	 * @param {Instance} scope - the course instance scope.
	 * @param {QuestionSet} item - the question set instance to place.
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
	 *                    "item" (QuestionSet) can be placed. Rejects on errors.
	 */
	getItems () {
		return Promise.resolve([]);
	}

}
