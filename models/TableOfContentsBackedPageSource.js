import Base from './Base';

import {encodeForURI as encodeNTIIDForURI} from '../utils/ntiids';

const Service = Symbol.for('Service');


function buildRef(node, root) {
	return node && {
		ntiid: node.get('ntiid'),
		title: node.get('label'),
		// Lets not make paths longer than they have to...
		// The pattern will be the view is prefixed with the root in the slug.
		// Adding a page id at the end would be redundant. The "Root" is the
		// "default" pageId.
		ref: node === root ?
			'/' : encodeNTIIDForURI(node.get('ntiid'))
	};
}


export default class TableOfContentsBackedPageSource extends Base{
	constructor (ToC, root) {
		super(ToC[Service], ToC);

		this.root = ToC.getNode(root);

		try {
			this.pagesInRange = flatten(this.root).filter(suppressed);
		}
		catch(e) {
			console.error(e.stack || e.message || e);
			throw e;
		}
	}


	getPagesAround (pageId) {
		let query = './/*[@ntiid="' + pageId + '"]';
		let {root} = this;
		let node = root.find(query) || (root.get('ntiid') === pageId && root);
		let nodes = this.pagesInRange;

		let index = nodes.indexOf(node);

		let next = nodes[index + 1];
		let prev = nodes[index - 1];

		return {
			total: nodes.length,
			index: index,
			next: buildRef(next, root),
			prev: buildRef(prev, root)
		};
	}

}



function suppressed(node) {
	let isAnchor = suppressed.is || (suppressed.id = /#/);
	let isTopic = suppressed.tag || (suppressed.tag = /topic/i);

	return node && isTopic.test(node.tag) && !isAnchor.test(node.get('href'));
}

function flatten(node) {
	let fn = flatten.fnLoop || (flatten.fnLoop = (a, n)=>a.concat(flatten(n)));
	//We don't control the name "_children"...silence error/warning
	return [node].concat(node._children.reduce(fn, [])); // eslint-disable-line no-underscore-dangle
}
