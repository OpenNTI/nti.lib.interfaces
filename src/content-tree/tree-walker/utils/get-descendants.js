import { nodeMatches } from '../../utils/index.js';

export async function getNodes(root, skip, ignoreChildren) {
	const skipRoot = await nodeMatches(root, skip);

	let nodes = [];
	let pointer = root.createTreeWalker(root, { skip, ignoreChildren });

	if (!skipRoot) {
		nodes.push(root);
	}

	pointer = pointer.selectFirstDescendant();

	while (pointer) {
		const pointerNode = await pointer.getCurrentNode();
		const isEmpty = !pointerNode || (await pointerNode.isEmptyNode());

		if (isEmpty) {
			pointer = null;
		} else {
			nodes.push(pointerNode);
			pointer = pointer.selectNext();
		}
	}

	return nodes;
}

export async function getNodesBefore(root, predicate, skip, ignoreChildren) {
	const nodes = await getNodes(root, skip, ignoreChildren);

	let before = [];

	for (let node of nodes) {
		const matches = await nodeMatches(node, predicate);

		if (matches) {
			return before;
		}

		before.push(node);
	}

	return [];
}

export async function getNodesAfter(root, predicate, skip, ignoreChildren) {
	const nodes = await getNodes(root, skip, ignoreChildren);

	let after = [];

	for (let i = nodes.length - 1; i >= 0; i--) {
		const matches = await nodeMatches(nodes[i], predicate);

		if (matches) {
			return after;
		}

		after.unshift(nodes[i]);
	}

	return [];
}

export async function getIndexOf(root, predicate, skip, ignoreChildren) {
	const nodes = await getNodes(root, skip, ignoreChildren);

	for (let i = 0; i < nodes.length; i++) {
		const matches = await nodeMatches(nodes[i], predicate);

		if (matches) {
			return i;
		}
	}

	return -1;
}

export async function getNodeCount(root, skip, ignoreChildren) {
	const nodes = await getNodes(root, skip, ignoreChildren);

	return nodes.length;
}
