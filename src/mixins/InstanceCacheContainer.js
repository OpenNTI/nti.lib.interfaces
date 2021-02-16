const CACHE = new WeakMap();

export function getCacheFor(o) {
	return CACHE.get(o);
}

export const Mixin = {
	initMixin() {
		CACHE.set(this, {});
	},
};
