/* eslint-env jest */

export function createMockNode (item, {filtered, flattened, find, children, next, prev, parent} = {}) {
	const mock = {
		getItem: async () => item,
		getParentNode: async () => parent,
		filter: () => filtered,
		flatten: () => flattened,
		find: () => find,
		getChildNodes: async () => children,
		findNextSibling: async () => next,
		findPrevSibling: async () => prev
	};

	jest.spyOn(mock, 'getItem');
	jest.spyOn(mock, 'filter');
	jest.spyOn(mock, 'flatten');
	jest.spyOn(mock, 'find');
	jest.spyOn(mock, 'getChildNodes');

	return mock;
}
