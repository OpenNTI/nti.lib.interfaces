import { isSameNode, nodeMatches } from '../../utils';

async function findFirstDescendant(node) {
	const children = await node.getChildNodes();

	return children && children.length ? children[0] : null;
}

async function findLastDescendant(node) {
	const children = await node.getChildNodes();
	const lastChild =
		children && children.length ? children[children.length - 1] : null;

	if (!lastChild) {
		return null;
	}

	const lastChildsDescendant = await findLastDescendant(lastChild);

	return lastChildsDescendant || lastChild;
}

async function getParent(node) {
	const parent = await node.getParentNode();
	const empty = !parent || (await parent.isEmptyNode());

	return empty ? null : parent;
}

async function getParentNextSibling(node, root) {
	let pointer = await node.getParentNode();

	while (pointer) {
		const isRoot = await isSameNode(pointer, root);

		if (isRoot) {
			return null;
		}

		const sibling = await getNextSibling(pointer);

		if (sibling) {
			return sibling;
		}

		pointer = await getParent(pointer);
	}

	return null;
}

async function getNextSibling(node) {
	const sibling = node.findNextSibling();
	const empty = !sibling || (await sibling.isEmptyNode());

	return empty ? null : sibling;
}

async function getPrevSibling(node) {
	const sibling = node.findPrevSibling();
	const empty = !sibling || (await sibling.isEmptyNode());

	return empty ? null : sibling;
}

export async function selectNext(node, root, skip, ignoreChildren) {
	let pointer = node;

	while (pointer) {
		const isRoot = await isSameNode(pointer, root);

		if (isRoot) {
			return null;
		}

		const skipped = await nodeMatches(pointer, skip);
		const ignored = await nodeMatches(pointer, ignoreChildren);

		if (pointer !== node && !skipped) {
			return pointer;
		}

		const descendant = !ignored && (await findFirstDescendant(pointer));

		if (descendant) {
			pointer = descendant;
			continue;
		}

		const sibling = await getNextSibling(pointer);

		if (sibling) {
			pointer = sibling;
			continue;
		}

		const parent = await getParent(pointer);
		const parentIsRoot = parent && (await isSameNode(parent, root));

		if (parentIsRoot) {
			return null;
		}

		const parentSibling = await getParentNextSibling(pointer, root);

		if (parentSibling) {
			pointer = parentSibling;
			continue;
		}

		pointer = null;
	}

	return null;
}

export async function selectPrev(node, root, skip, ignoreChildren) {
	const isStartingRoot = await isSameNode(node, root);

	if (isStartingRoot) {
		return null;
	}

	let pointer = node;

	while (pointer) {
		const isRoot = await isSameNode(pointer, root);

		if (isRoot) {
			const skipRoot = await nodeMatches(pointer, skip);

			if (skipRoot) {
				return null;
			}

			return pointer;
		}

		const skipped = await nodeMatches(pointer, skip);

		if (pointer !== node && !skipped) {
			return pointer;
		}

		const sibling = await getPrevSibling(pointer);
		const ignored = sibling && (await nodeMatches(sibling, ignoreChildren));
		const descendant =
			!ignored && sibling && (await findLastDescendant(sibling));

		if (descendant) {
			pointer = descendant;
			continue;
		}

		if (sibling) {
			pointer = sibling;
			continue;
		}

		const parent = await getParent(pointer);

		if (parent) {
			pointer = parent;
			continue;
		}

		pointer = null;
	}

	return null;
}
