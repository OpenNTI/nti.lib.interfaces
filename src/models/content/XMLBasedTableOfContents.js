import XML from 'elementtree';

import Base from '../Base';

import PageSource from './TableOfContentsBackedPageSource';
import Node from './TableOfContentsNode';


export default class XMLBasedTableOfContents extends Base {

	constructor (service, parent, data, title) {
		super(service, parent, null);

		let {numbering, toc = {}} = (parent || {}).PresentationProperties || {};

		let xml = XML.parse(data);

		Object.assign(this, {
			MAX_LEVEL: toc['max-level'] || Infinity,
			numbering,
			title,
			xml,
			root: new Node(this, xml.getroot(), this)
		});
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
				console.warn('Found multiple elements for id %s: %o', id, list); //eslint-disable-line no-console
			}

			node = list[0];
			node = node && new Node(this, node);
		}

		return node;
	}


	indexOf (id) {
		let node = this.getNode(id);
		return (node && node.idx) || -1;
	}


	getPageSource (rootId) {
		try {
			return new PageSource(this, rootId);
		} catch (e) {
			return null;
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


	get children () { return this.root.children; }
	get id () { return this.getID(); }
	get length () { return this.root.length; }
	get tag () { return this.root.tag; }


	get (attr) { return this.root.get(attr); }

	getAttribute (...a) { return this.get(...a); }

	getID () { return this.get('ntiid'); }

	// filter (...args) {
	// 	let filtered = this.root.filter(...args);
	// 	return new FilteredTableOfContents(filtered);
	// }

	flatten () { return this.root.flatten(); }
}
