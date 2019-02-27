export const GET_CONTENT_TREE_CHILDREN = Symbol('Get Content Tree Children');

export const ERRORS = {
	getMessage: (msg) => `ContentTree: ${msg}`,
	EMPTY_NODE: class EmptyNode extends Error { name = 'Empty Node' }
};
