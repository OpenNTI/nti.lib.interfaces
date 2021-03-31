import { resolveChildrenItems } from './resolve-children-items.js';

export async function filter(children, filterFn, recursive) {
	if (!children || !children.length) {
		return children;
	}

	const resolved = await resolveChildrenItems(children);

	return resolved.reduce((acc, { node, item }) => {
		if (!filterFn(item)) {
			acc.push(recursive ? node.filter(filterFn) : node);
		}

		return acc;
	}, []);
}
