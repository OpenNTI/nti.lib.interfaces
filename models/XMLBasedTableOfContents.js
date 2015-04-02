import Base from './Base';

import xml from 'elementtree';
import PageSource from './TableOfContentsBackedPageSource';
import forwardFunctions from '../utils/function-forwarding';


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

	constructor (service, parent, data) {
		super(service, parent, null, forwardFunctions(['find'], 'root'));

		this.root = xml.parse(data);
		cleanNodes(this.root, this);
	}



	getVideoIndexRef () {
		let ref = this.root.find('.//reference[@type="application/vnd.nextthought.videoindex"]');
		return ref && ref.get('href');
	}


	getNode (id) {
		let n = this.root,
			r = n._root; // eslint-disable-line no-underscore-dangle

		if (r.get('ntiid') === id) {
			return r;
		}

		let list = n.findall('.//*[@ntiid="' + id + '"]') || [];

		if (list.length > 1) {
			console.warn('Found multiple elements for id %s: %o', id, list);
		}

		return list[0];
	}


	getSortPosition (id) {
		let node = this.getNode(id);
		return (node && node._id) || -1; // eslint-disable-line no-underscore-dangle
	}


	getPageSource (rootId) {
		return new PageSource(this, rootId);
	}

}
