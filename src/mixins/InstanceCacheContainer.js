const CACHE = new WeakMap();

export function getCacheFor(o) {
	return CACHE.get(o);
}

/**
 * @template {import('../types').Constructor} T
 * @param {T} Base
 * @mixin
 */
export default Base =>
	class extends Base {
		constructor(...args) {
			super(...args);
			CACHE.set(this, {});
		}
	};
