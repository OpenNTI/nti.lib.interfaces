const DATA = Symbol('data');

import escape from '../utils/regexp-escape';

const flat = (a, n)=> a.concat(n.flatten());

const anchor = RegExp.prototype.test.bind(/#/i);
const topic = RegExp.prototype.test.bind(/topic/i);

export default class XMLBasedTableOfContentsNode {

	constructor (toc, data, parent) {
		this[DATA] = data;
		this.parent = parent;
		this.toc = toc;
		try {
			//FIXME: We should be using the depth of the tree instead of relying on an ATTRIBUTE of a topic...
			this.level = parseInt(this.get('levelnum'), 10);
		} catch (e) {
			console.warn('This node does not have a valid `levelnum` attribute: %o', data);
			this.level = -1;
		}
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
		return this[DATA].getchildren().map(n => new XMLBasedTableOfContentsNode(this.toc, n, this));
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


	// filter (filter) {
	// 	if (!filter || typeof filter !== 'function') {
	// 		throw new Error('Illegal Argument');
	// 	}
	//
	// 	let flattened = this.flatten();
	// 	let prune = flattened.filter(x=> !filter(x));
	//
	// 	console.log(prune);
	//
	// 	return this;
	// }


	getAchorTarget () {
		let href = this.get('href');
		return href.split(/#/)[1];
	}


	getMatchExp (substring) {
		return new RegExp(`(${escape(substring)})`, 'igm');
	}


	isAnchor () {
		return anchor(this.get('href'));
	}

	isTopic () {
		return topic(this.tag);
	}

	isBeyondLevel () {
		return this.level > this.toc.MAX_LEVEL;
	}

	matches (substring, deep = true) {
		let {title} = this;
		let re = this.getMatchExp(substring);

		let aDescendantMatches = () => this.children.some(n => n.matches(substring));
		return re.test(title) || (deep && aDescendantMatches());
	}


	flatten () {
		return [this].concat(this.children.reduce(flat, []));
	}
}
