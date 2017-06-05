import Base from '../Base';

const TABLES = Symbol('tables');

export default class TablesOfContents extends Base {

	static fromIterable (iterable, service, parent) {
		let result = [];

		for(let v of iterable) {
			result.push(v);
		}

		return new TablesOfContents(service, parent, result);
	}

	constructor (service, parent, tables) {
		super(service, parent);
		this[TABLES] = tables;
	}


	[Symbol.iterator] () {
		let tables = this[TABLES],
			{length} = tables,
			index = 0;

		return {
			next () {
				let done = index >= length,
					value = tables[index++];

				return { value, done };
			}
		};
	}


	get length () { return this[TABLES].length; }


	getAt (idx) {
		return this[TABLES][idx];
	}


	getNode (id) {
		return this[TABLES].reduce(
			(found, toc)=> found || toc.getNode(id),
			null);
	}


	filter (...args) { return this[TABLES].filter(...args); }

	map (...args) { return this[TABLES].map(...args); }

	reduce (...args) { return this[TABLES].reduce(...args); }
}
