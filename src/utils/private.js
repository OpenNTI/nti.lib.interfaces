const PRIVATE = new WeakMap();

export function initPrivate(x, o = {}) {
	if (PRIVATE.has(x)) {
		throw new Error('Cannot reinitalize private slot.');
	}

	PRIVATE.set(x, o);
}

export const getPrivate = x => PRIVATE.get(x);
