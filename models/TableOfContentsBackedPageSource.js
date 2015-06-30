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

		this.pages = this.root.flatten();
		this.pagesInRange = this.pages.filter(suppressed);
	}z


	getPagesAround (pageId) {
		let query = './/*[@ntiid="' + pageId + '"]';
		let {root} = this;

		let node = root.find(query) || (root.get('ntiid') === pageId && root);
		let nodes = this.pagesInRange;

		let index = this.find(node);
		let next = index < 0 ? null : nodes[index + 1];
		let prev = index < 0 ? null : nodes[index - 1];

		return {
			total: nodes.length,
			index: index,
			next: buildRef(next, root),
			prev: buildRef(prev, root)
		};
	}


	find (node) {
		let nodes = this.pagesInRange;
		let matcher = n => n.id === node.id;

		let index = nodes.findIndex(matcher);
		if (index < 0) {
			//The node we're looking for is suppressed... it MUST be decendent to a non-suppressed node.
			index = this.pages.findIndex(matcher);
			if (index < 0) {
				return -1;
			}

			do { node = this.pages[index--]; } while(node && !suppressed(node));

			return node ? nodes.findIndex(matcher) : -1;
		}

		return index;
	}

}



function suppressed(node) {
	return node && node.isTopic() && !node.isAnchor();
}
