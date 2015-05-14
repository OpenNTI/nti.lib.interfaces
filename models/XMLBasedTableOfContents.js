import Base from './Base';

import XML from 'elementtree';
import PageSource from './TableOfContentsBackedPageSource';
import Node from './TableOfContentsNode';

function cleanNodes(x, o) {
	function getParent(e) {
		let key = 'ntiid',
		id = e.get(key);

		if (!id) {
			key = 'target-ntiid';
			id = e.get(key);
		}

		return x.find('*[@' + key + '="' + id + '"]/..') || {remove: ()=> {}};
	}

	let hiddenMethod = Symbol.for('ToC:PerformNodeFilter');

	let p = o.parent(hiddenMethod);

	if (p) {
		p[hiddenMethod](x, e=>getParent(e).remove(e));
	}

	return x;
}


export default class TableOfContents extends Base {

	constructor (service, parent, data, title) {
		super(service, parent, null);

		this.title = title;
		this.xml = XML.parse(data);
		this.root = new Node(this, this.xml.getroot(), this);

		cleanNodes(this.xml, this);
	}


	find (query) {
		let n = this.xml.find(query);
		return n && new Node(this, n);
	}


	getVideoIndexRef () {
		let ref = this.xml.find('.//reference[@type="application/vnd.nextthought.videoindex"]');
		return ref && ref.get('href');
	}


	getNode (id) {
		let {root, xml} = this;
		let node = root;

		if (root.id !== id) {

			let list = xml.findall('.//*[@ntiid="' + id + '"]') || [];

			if (list.length > 1) {
				console.warn('Found multiple elements for id %s: %o', id, list);
			}

			node = list[0];
			node = node && new Node(this, node);
		}

		return node;
	}


	getSortPosition (id) {
		let node = this.getNode(id);
		return (node && node.idx) || -1;
	}


	getPageSource (rootId) {
		return new PageSource(this, rootId);
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


	get children () { return this.root.children; }
	get id () { return this.getID(); }
	get length () { return this.root.length; }
	get tag () { return this.root.tag; }


	get (attr) { return this.root.get(attr); }

	getAttribute (...a) { return this.get(...a); }

	getID() { return this.get('ntiid'); }

	// filter (...args) {
	// 	let filtered = this.root.filter(...args);
	// 	return new FilteredTableOfContents(filtered);
	// }

	flatten () { return this.root.flatten(); }
}
