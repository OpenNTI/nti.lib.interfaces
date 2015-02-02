import Base from '../Base';
import {
	Service
} from '../../CommonSymbols';

export default class OutlineNodeBackedPageSource extends Base {

	constructor (node, root) {
		super(node[Service], node);

		this.root = root;
		this.current = node;

		try {
			this.pagesInRange = flatten(root).filter(suppressed);
		}
		catch(e) {
			console.error(e.stack || e.message || e);
			throw e;
		}
	}


	getPagesAround (pageId) {
		const nodes = this.pagesInRange;
		const index = nodes.reduce((found, node, index) =>
			(typeof found !== 'number' && node.getID() === pageId) ? index : found, null);

		let next = nodes[index + 1];
		let prev = nodes[index - 1];

		return {
			total: nodes.length,
			index: index,
			next: buildRef(next),
			prev: buildRef(prev)
		};
	}

}


function buildRef(node) {
	return node && {
		ntiid: node.getID(),
		title: node.title,
		ref: node.ref
	};
}


function suppressed(node) {
	return node && node.href;
}

function flatten(node) {
	const fn = flatten.fnLoop ||
		(flatten.fnLoop = (a, n)=> a.concat(flatten(n)));

	return [node].concat(node.contents.reduce(fn, []));
}
