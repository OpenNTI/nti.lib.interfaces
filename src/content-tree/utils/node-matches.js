export default async function nodeMatches(node, predicate) {
	if (!predicate) {
		return false;
	}

	const item = await node.getItem();

	return predicate(item);
}
