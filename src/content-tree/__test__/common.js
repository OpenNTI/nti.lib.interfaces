/* eslint-env jest */

export function createMockNode(
	item,
	{ filtered, flattened, find, findChild, children, next, prev, parent } = {}
) {
	const mock = {
		isEmptyNode: async () => !item,
		getItem: async () => item,
		getParentNode: async () => parent,
		filter: () => filtered,
		flatten: () => flattened,
		find: () => find,
		findChild: () => findChild,
		getChildNodes: async () => children,
		findNextSibling: () => next,
		findPrevSibling: () => prev,
	};

	jest.spyOn(mock, 'getItem');
	jest.spyOn(mock, 'filter');
	jest.spyOn(mock, 'flatten');
	jest.spyOn(mock, 'find');
	jest.spyOn(mock, 'getChildNodes');

	return mock;
}
