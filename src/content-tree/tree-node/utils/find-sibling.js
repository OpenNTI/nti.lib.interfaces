import {isSameNode} from '../../utils';

async function getIndex (children, node) {
	for (let i = 0; i < children.length; i++) {
		const isSame = await isSameNode(children[i], node);

		if (isSame) {
			return i;
		}
	}

	return -1;
}

async function findSiblingAround (node, offset) {
	const parent = await node.getParentNode();

	if (!parent) { return null; }

	const children = await parent.getChildNodes();
	const index = await getIndex(children, node);

	if (index === -1) { return null; }

	const nextIndex = index + offset;

	return children[nextIndex] || null;
}

export function findNextSibling (node) {
	return findSiblingAround(node, 1);
}

export function findPrevSibling (node) {
	return findSiblingAround(node, -1);
}
