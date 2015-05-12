const DATA = Symbol('data');

export default class XMLBasedTableOfContentsNode {

	constructor (toc, data) {
		this.toc = toc;
		this[DATA] = data;
	}


	[Symbol.iterator] () {
		let {children} = this,
			{length} = children,
			index = 0;

		return {

			next () {
				let done = index >= length,
					value = children[index++];

				return { value, done };
			}

		};
	}


	get children () {
		return this[DATA].getchildren().map(n => new XMLBasedTableOfContentsNode(this.toc, n));
	}

	get id () { return this.getID(); }


	get idx () { return this[DATA]._id; }//eslint-disable-line no-underscore-dangle


	get length () { return this[DATA].getchildren().length; }


	get tag () { return this[DATA].tag; }


	get title () { return this.get('label'); }


	get type () { return this.get('level'); }


	find (...args) {
		let n = this[DATA].find(...args);
		return n && new XMLBasedTableOfContentsNode(this.toc, n);
	}


	getAttribute (...a) { return this.get(...a); }


	get (attr) {
		return this[DATA].get(attr);
	}


	getID() {
		return this.get('ntiid') || console.warn('No ntiid', this);
	}


	filter (...args) { return this.children.filter(...args); }

	map (...args) { return this.children.map(...args); }

	reduce (...args) { return this.children.reduce(...args); }

}
