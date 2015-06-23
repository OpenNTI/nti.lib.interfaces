import Base from './Base';

import {encodeForURI as encodeNTIIDForURI} from '../utils/ntiids';

const Service = Symbol.for('Service');


function buildRef(node/*, root*/) {
	return node && {
		ntiid: node.get('ntiid'),
		title: node.get('label'),
		ref: encodeNTIIDForURI(node.get('ntiid'))
	};
}


export default class TableOfContentsBackedPageSource extends Base{
	constructor (ToC, root) {
		super(ToC[Service], ToC);

		if (!root) {
			root = ToC.root.id;
		}

		this.root = ToC.getNode(root);
		if (!this.root) {
			throw new Error(`The root "${root}" does not exist in the ToC`);
		}

		this.pagesInRange = this.root.flatten().filter(suppressed);
	}


	getPagesAround (pageId) {
		let query = './/*[@ntiid="' + pageId + '"]';
		let {root} = this;

		let node = root.find(query) || (root.get('ntiid') === pageId && root);
		let nodes = this.pagesInRange;

		let index = nodes.findIndex(n => n.id === node.id);

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
	return node && node.isTopic() && !node.isAnchor();
}
