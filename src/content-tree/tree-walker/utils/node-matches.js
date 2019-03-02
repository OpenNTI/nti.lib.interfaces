export default async function nodeMatches (node, predicate) {
	if (!predicate) { return true;}

	const item = await node.getItem();


	return predicate(item);
}
