import nodeMatches from './node-matches';

function buildPredicate (skip, predicate) {
	return (item) => {
		const shouldSkip = !skip || !skip(item);
		const matches = !predicate || predicate(item);

		return !shouldSkip && matches;
	};
}

export async function selectDescendantMatching (node, predicate, skip, ignoreChildren) {
	const check = buildPredicate(skip, predicate);
	const childMatching = node.findChild(check);
	const noChild = await childMatching.isEmpty();

	if (!noChild) { return childMatching; }

	const children = await node.getChildNodes();

	if (!children || !children.length) { return null; }

	for (let child of children) {
		const ignore = await nodeMatches(child, ignoreChildren);

		if (ignore) { continue; }

		const matchingDescendant = await selectDescendantMatching(node, predicate, skip, ignoreChildren);

		if (matchingDescendant) {
			return matchingDescendant;
		}
	}

	return null;

}

export async function selectFirstDescendant (node, skip, ignoreChildren) {
	return selectDescendantMatching(node, () => true, skip, ignoreChildren);
}
