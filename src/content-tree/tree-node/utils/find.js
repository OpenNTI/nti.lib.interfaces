import {nodeMatches} from '../../utils';

import resovleChildrenItems from './resolve-children-items';

async function matches ({item, node}, predicate) {
	if (typeof predicate === 'function') {
		return predicate(item);
	}

	return false;
}

async function findMatch (children, predicate) {
	const resolved = await resovleChildrenItems(children);

	for (let child of resolved) {
		const match = await matches(child, predicate);

		if (match) {
			return child.node;
		}
	}

	return null;
}


async function getNextIteration (children) {
	const subChildren = await Promise.all(
		children.map(async (child) => {
			const nodes = await child.getChildNodes();

			return nodes;
		})
	);

	return subChildren.reduce((acc, child) => {
		if (child) {
			return acc.concat(child);
		}

		return acc;
	}, []);
}

export async function find (children, predicate, recursive) {
	if (!children || !children.length || !predicate) { return null; }

	const match = await findMatch(children, predicate);

	if (match) { return match; }
	if (!recursive) { return null; }

	const iteration = await getNextIteration(children);

	return find(iteration, predicate, true);
}

export async function findParent (node, predicate) {
	let pointer = await node.getParentNode();

	while (pointer) {
		const found = await nodeMatches(pointer, predicate);

		if (found) { return pointer; }

		pointer = await pointer.getParentNode();
	}

	return null;
}

export async function findParentOrSelf (node, predicate) {
	const found = await nodeMatches(node, predicate);

	if (found) { return node; }

	return findParent(node, predicate);
}
