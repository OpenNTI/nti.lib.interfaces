import {defineProtected} from 'nti-commons';

import {placeItemIn, removeItemFrom} from '../factories';

const AssignmentType = 'application/vnd.nextthought.assessment.assignment';


const Handlers = {
	[AssignmentType]: (item, scope) => {
		if (!scope && !scope.getAllAssignments) {
			return Promise.resolve();
		}

		return scope.getAllAssignments()
			.then(assignments => assignments.filter(x => x.hasLink('edit')));
	}
};

function resolveAll (item, scope) {
	const keys = Object.keys(Handlers);

	return Promise.all(keys.map(key => {
		return Handlers[key](item, scope);
	}));
}


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
	 * @param {[String]} accepts list of mime types to accept, accept all if empty
	 * @returns {Promise} Fulfills with an array of items that the given
	 *                    "item" (Question) can be placed. Rejects on errors.
	 */
	getItems (accepts) {
		//For now, Questions can be placed in QuestionSets... assignments reference questionsets.
		//This should perform the appropriate lookups...
		if (!Array.isArray(accepts)) {
			accepts = [accepts];
		}

		const {item, scope} = this;
		let resolve;

		if (accepts) {
			resolve = Promise.all(accepts.map(accept => {
				if (Handlers[accept]) {
					return Handlers[accept](item, scope);
				} else {
					return Promise.resolve();
				}
			})).then(results => {
				return results.reduce((acc, result) => {
					return acc.concat(result);
				}, []);
			});
		} else {
			resolve = resolveAll(item, scope);
		}

		return resolve;
	}


	//Get a list of questionSets from the scope.
	getQuestionSets () {}

	//Get a list of assignments from the scope.
	getAssignments () {}


	placeIn (container) {
		return placeItemIn(this.item, container, this.scope);
	}

	removeFrom (container) {
		return removeItemFrom(this.item, container, this.scope);
	}

}
