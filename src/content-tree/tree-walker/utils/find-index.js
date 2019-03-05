import nodeMatches from './node-matches';

export default async function findIndex (node, predicate, skip, ignoreChildren) {
	const children = await node.getChildNodes();

	if (!children || !children.length) { return -1; }

	const firstChild = children[0];
	let pointer = firstChild.createTreeWalker(node, {skip, ignoreChildren});
	let count = 0;

	while (pointer) {
		pointer = pointer.selectNext();

		const pointerNode = await pointer.getCurrentNode();
		const isEmpty = !pointerNode || await pointerNode.isEmptyNode();
		const matches = pointerNode && await nodeMatches(pointerNode, predicate);

		if (matches) { return count; }
		if (isEmpty) { return -1;}

		count += 1;
	}

	return -1;
}
