import defineProtected from 'nti-commons/lib/object-define-protected';

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
	 * @returns {Promise} Fulfills with an array of items that the given "item" (Question) can be placed. Rejects on errors.
	 */
	getItems () {
		return Promise.resolve([]);
	}

}
