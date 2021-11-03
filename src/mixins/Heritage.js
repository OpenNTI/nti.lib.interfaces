import { Parent } from '../constants.js';
// import ServiceDocument from '../stores/Service.js';

const is = Symbol('isTest');

/**
 * @template {import('../types').Constructor} T
 * @param {T} Base
 * @mixin
 */
export default Base =>
	class Heritage extends Base {
		constructor(...args) {
			super(...args);
			//only allow lib-interface models and null as "parents"
			this[Parent] = args.find(
				x => x && !x.isService && x instanceof Heritage
			);
		}

		/**
		 * Returns the first parent that matches the given query. If no query is given, the immediate parent is returned.
		 *
		 * If only one argument is given, it will look for the first parent that has that attribute (ignoring value)
		 * If two arguments are given, then it will look for the first parent that has that attribute and matches the
		 * attributeValue test.
		 *
		 * @param {Array} query The arguments:
		 *                      {string} query[0] attribute - The name of a property/attribute name.
		 *                      {string|RegExp} query[1] attributeValue - The (optional) value or value tester
		 * @returns {(typeof this)?} The model that passes the test.
		 */
		parent(...query) {
			let p = this[Parent];

			if (p && typeof p.parent !== 'function' && p[Parent]) {
				p = p[Parent];
			}

			if (p && (query.length === 0 || (p[is] && p[is](...query)))) {
				return p;
			}

			return p && typeof p.parent === 'function'
				? p.parent(...query)
				: void 0;
		}

		/**
		 * Returns a list of parents that match the given query. If no query is given, all parents are returned.
		 *
		 * @see #up()
		 * @param {Array} query The arguments:
		 *                      {string} query[0] attribute - The name of a property/attribute name.
		 *                      {string|RegExp} query[1] attributeValue - The (optional) value or value tester
		 * @returns {(typeof this)[]} All the parents that match the query
		 */
		parents(...query) {
			/** @type {(typeof this)[]} */
			let matches = [];
			let p = this[Parent];

			if (p && p.parents) {
				matches = p.parents(...query);
				if (query.length === 0 || (p[is] && p[is](...query))) {
					matches.push(p);
				}
			}

			return matches;
		}

		reparent(newParent) {
			this[Parent] = newParent;
		}

		[is](attributeQuery, attributeQueryValue) {
			if (attributeQueryValue === undefined) {
				//like array::filter() callback...
				if (typeof attributeQuery === 'function') {
					return attributeQuery(this);
				}

				//RegExp::test()
				if (attributeQuery && attributeQuery.test) {
					return attributeQuery.test(this);
				}

				//fallback
				return this[attributeQuery] !== undefined;
			}

			//RegExp
			if (attributeQueryValue && attributeQueryValue.test) {
				return attributeQueryValue.test(this[attributeQuery]);
			}

			return this[attributeQuery] === attributeQueryValue;
		}
	};
