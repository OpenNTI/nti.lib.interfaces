const PRIVATE = new WeakMap();

export function initPrivate(x, o = {}) {
	if (PRIVATE.has(x)) {
		throw new Error('Cannot reinitialize private slot.');
	}

	PRIVATE.set(x, o);
}

export const getPrivate = x => {
	if (!PRIVATE.has(x)) {
		initPrivate(x);
	}
	return PRIVATE.get(x);
};
