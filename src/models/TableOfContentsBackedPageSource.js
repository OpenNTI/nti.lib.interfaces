import Base from './Base';

import {encodeForURI as encodeNTIIDForURI} from 'nti-lib-ntiids';

const Service = Symbol.for('Service');


function buildRef (node/*, root*/) {
	return node && {
		ntiid: node.get('ntiid'),
		title: node.get('label'),
		ref: encodeNTIIDForURI(node.get('ntiid'))
	};
}


export default class TableOfContentsBackedPageSource extends Base {
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
	}


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


	contains (node) {
		return this.find(node) >= 0;
	}


	find (node) {
		let nodes = this.pagesInRange;
		let nodeId = node && (typeof node === 'string' ? node : node.id);
		let matcher = n => n.id === nodeId;

		let index = nodes.findIndex(matcher);
		if (index < 0) {
			//The node we're looking for is suppressed... it MUST be decendent to a non-suppressed node.
			index = this.pages.findIndex(matcher);
			if (index < 0) {
				return -1;
			}

			do { node = this.pages[index--]; } while(node && !suppressed(node));

			if (node) {
				nodeId = node.id;
				index = nodes.findIndex(matcher);

			} else {
				index = -1;
			}
		}

		return index;
	}

}



function suppressed (node) {
	return node && node.isTopic() && !node.isAnchor();
}
