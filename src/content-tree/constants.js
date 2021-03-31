export const ERRORS = {
	getMessage: msg => `ContentTree: ${msg}`,
	throwIfNotFunction: (maybeFn, msg) => {
		if (!maybeFn || typeof maybeFn !== 'function') {
			throw new Error(msg);
		}
	},
};
