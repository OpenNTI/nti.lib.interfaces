const CACHE = new WeakMap();

export function getCacheFor(o) {
	return CACHE.get(o);
}

export const Mixin = Base =>
	class extends Base {
		constructor(...args) {
			super(...args);
			CACHE.set(this, {});
		}
	};
