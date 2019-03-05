import nodeMatches from './node-matches';

export default async function getDescendantCount (node, skip, ignoreChildren) {
	const children = await node.getChildNodes();

	if (!children || !children.length) { return 0; }

	let count = 0;

	for (let child of children) {
		const skipped = await nodeMatches(child, skip);
		const ignored = await nodeMatches(child, ignoreChildren);

		if (!skipped) {
			count += 1;
		}

		if (ignored) { continue; }

		const grandChildrenCount = await getDescendantCount(child, skip, ignoreChildren);

		count += grandChildrenCount;
	}

	return count;
}
