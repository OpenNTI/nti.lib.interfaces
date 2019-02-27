/* eslint-env jest */

export function createMockNode (item, {filtered, flattened, find, children} = {}) {
	const mock = {
		getItem: async () => item,
		filter: () => filtered,
		flatten: () => flattened,
		find: () => find,
		getChildNodes: async () => children
	};

	jest.spyOn(mock, 'getItem');
	jest.spyOn(mock, 'filter');
	jest.spyOn(mock, 'flatten');
	jest.spyOn(mock, 'find');
	jest.spyOn(mock, 'getChildNodes');

	return mock;
}
