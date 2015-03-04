import path from 'path';

import Base from './Base';

import {encodeForURI as encodeNTIIDForURI} from '../utils/ntiids';

import {Parent, Service} from '../CommonSymbols';

export default class VideoIndexBackedPageSource extends Base {

	constructor (index) {
		super(index[Service], index);
	}


	getPagesAround (pageId) {
		let nodes = this[Parent];
		let index = nodes.reduce(
			(found, node, index) => (typeof found !== 'number' && node.getID() === pageId) ? index : found,
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


	scopped (containerId) {
		let subset = this[Parent].scopped(containerId);
		return new this.constructor(subset);
	}
}


function buildRef(node) {
	let id = node && node.getID();
	return id && {
		ntiid: id,
		title: node.title,
		ref: path.join('v', encodeNTIIDForURI(id))
	};
}
