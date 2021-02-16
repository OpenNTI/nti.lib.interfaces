export default async function isSameNode(nodeA, nodeB) {
	if ((!nodeA && nodeB) || (nodeA && !nodeB)) {
		return false;
	}

	if (nodeA === nodeB) {
		return true;
	}

	const itemA = await nodeA.getItem();
	const itemB = await nodeB.getItem();

	return itemA === itemB;
}
