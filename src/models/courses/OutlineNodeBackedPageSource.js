import Base from '../Model.js';
import { Service } from '../../constants.js';

const getNodeId = node => node.getContentId();
const buildRef = node =>
	node && { ntiid: getNodeId(node), title: node.title, ref: node.ref };
const suppressed = node => node && node.ref;

export default class OutlineNodeBackedPageSource extends Base {
	constructor(node, root) {
		super(node[Service], node);

		this.root = root;
		this.current = node;

		this.pagesInRange = root.getFlattenedList().filter(suppressed);
	}

	getPagesAround(pageId) {
		const nodes = this.pagesInRange;
		const index = nodes.reduce(
			(found, node, ix) =>
				typeof found !== 'number' && getNodeId(node) === pageId
					? ix
					: found,
			null
		);

		let next = nodes[index + 1];
		let prev = nodes[index - 1];

		return {
			total: nodes.length,
			index: index,
			next: buildRef(next),
			prev: buildRef(prev),
		};
	}
}
