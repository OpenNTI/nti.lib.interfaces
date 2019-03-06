import nodeMatches from './node-matches';

function buildPredicate (skip, predicate) {
	return (item) => {
		const shouldSkip = skip && skip(item);
		const matches = !predicate || predicate(item);

		return !shouldSkip && matches;
	};
}

async function selectFromList (nodes, predicate, ignoreChildren) {
	for (let node of nodes) {
		const matches = await nodeMatches(node, predicate);

		if (matches) { return node; }

		const ignore = await nodeMatches(node, ignoreChildren);

		if (ignore) { continue; }

		const children = await node.getChildNodes();
		const matchingChild = await selectFromList(children, predicate, ignoreChildren);

		if (matchingChild) { return matchingChild; }
	}

	return null;
}

export async function selectDescendantMatching (node, predicate, skip, ignoreChildren) {
	const ignore = await nodeMatches(node, ignoreChildren);

	if (ignore) { return null; }

	const check = buildPredicate(skip, predicate);
	const children = await node.getChildNodes();

	if (!children || !children.length) { return null; }

	return selectFromList(children, check, ignoreChildren);
}


export async function selectFirstDescendant (node, skip, ignoreChildren) {
	return selectDescendantMatching(node, () => true, skip, ignoreChildren);
}
