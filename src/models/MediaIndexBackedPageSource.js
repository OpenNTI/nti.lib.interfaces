import Base from './Base';

import {encodeForURI as encodeNTIIDForURI} from 'nti-lib-ntiids';

import {Parent, Service} from '../constants';

const getNodeId = node => node && (node.getContentId ? node.getContentId() : node.getID());

function buildRef (node) {
	const id = node && getNodeId(node);
	return id && {
		ntiid: id,
		title: node.title,
		ref: encodeNTIIDForURI(id)
	};
}


export default class MediaIndexBackedPageSource extends Base {

	constructor (index) {
		super(index[Service], index);
	}


	getPagesAround (pageId) {
		let nodes = this[Parent];
		let index = nodes.reduce(
			(found, node, ix) => (typeof found !== 'number' && getNodeId(node) === pageId) ? ix : found,
			null);


		let next = nodes.getAt(index + 1);
		let prev = nodes.getAt(index - 1);

		return {
			total: nodes.length,
			index: index,
			next: buildRef(next),
			prev: buildRef(prev)
		};
	}


	scoped (containerId) {
		let subset = this[Parent].scoped(containerId);
		return new this.constructor (subset);
	}
}
