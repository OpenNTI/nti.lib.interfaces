async function flattenChild (child) {
	const flattened = child.flatten();
	const children = await flattened.getChildNodes();

	if (!children) {
		return [child];
	}

	return [child, ...children];
}

export default async function flatten (children) {
	if (!children || !children.length) { return children; }

	const flattened = await Promise.all(
		children.map(async (child) => await flattenChild(child))
	);

	return flattened.reduce((acc, nodes) => acc.concat(nodes), []);
}
