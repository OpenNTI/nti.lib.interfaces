import {encodeForURI} from '../utils/ntiids';
import {join} from 'path';

function buildRef (node, pathPrefix) {
	return node && {
		ntiid: node.getID(),
		title: node.title,
		ref: join(pathPrefix, encodeForURI(node.getID()))
	};
}

export default class ListBackedPageSource {

	constructor (list, pathPrefix = '') {
		this.list = list;
		this.pathPrefix = pathPrefix;
	}


	getPagesAround (pageId) {
		const {list: nodes, pathPrefix} = this;
		const index = nodes.reduce(
			(found, node, ix) =>
				(typeof found !== 'number' && node.getID() === pageId) ? ix : found,
			null);

		let next = nodes[index + 1];
		let prev = nodes[index - 1];

		return {
			total: nodes.length,
			index: index,
			next: buildRef(next, pathPrefix),
			prev: buildRef(prev, pathPrefix)
		};
	}


	contains (node) {
		return this.find(node) >= 0;
	}


	find (node) {
		let nodeId = node && (typeof node === 'string' ? node : node.getID());
		let matcher = n => n.getID() === nodeId;
		return this.list.findIndex(matcher);
	}
}
