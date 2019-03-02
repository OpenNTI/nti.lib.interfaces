import {isSameNode} from '../../utils';

import nodeMatches from './node-matches';

async function findFirstDescendant (node) {
	const children = await node.getChildNodes();

	return children && children.length ? children[0] : null;
}

async function findLastDescendant (node) {
	const children = await node.getChildNodes();
	const lastChild = children && children.length ? children[children.length - 1] : null;

	if (!lastChild) {
		return null;
	}

	const lastChildsDescendant = await findLastDescendant(lastChild);

	return lastChildsDescendant || lastChild;
}

export async function selectNext (node, root, skip, ignoreChildren) {
	let pointer = node;

	while (pointer) {
		const isRoot = await isSameNode(pointer, root);

		if (isRoot) { return null; }

		const skipped = await nodeMatches(pointer, skip);
		const ignored = await nodeMatches(pointer, ignoreChildren);

		if (pointer !== node && !skipped) {
			return pointer;
		}

		const descendant = !ignored && await findFirstDescendant(pointer);

		if (descendant) {
			pointer = descendant;
			continue;
		}

		const sibling = await pointer.findNextSibling();

		if (sibling) {
			pointer = sibling;
			continue;
		}

		const parent = await pointer.getParentNode();
		const isParentRoot = await isSameNode(parent, root);
		const parentSibling = parent && await parent.findNextSibling();

		if (!isParentRoot && parentSibling) {
			pointer = parentSibling;
			continue;
		}

		pointer = null;
	}

	return null;
}

export async function selectPrev (node, root, skip, ignoreChildren) {
	const isStartingRoot = await isSameNode(node, root);

	if (isStartingRoot) { return null; }

	let pointer = node;

	while (pointer) {
		const isRoot = await isSameNode(pointer, root);

		if (isRoot) { return pointer; }

		const skipped = await nodeMatches(pointer, skip);

		if (pointer !== node && !skipped) {
			return pointer;
		}

		const sibling = await pointer.findPrevSibling();
		const ignored = sibling && await nodeMatches(sibling, ignoreChildren);
		const descendant = !ignored && sibling && await findLastDescendant(sibling);


		if (descendant) {
			pointer = descendant;
			continue;
		}

		if (sibling) {
			pointer = sibling;
			continue;
		}

		const parent = await pointer.getParentNode();

		if (parent) {
			pointer = parent;
			continue;
		}

		pointer = null;
	}

	return null;
}
