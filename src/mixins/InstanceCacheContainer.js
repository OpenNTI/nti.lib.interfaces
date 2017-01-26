const CACHE = new WeakMap();

export function getCacheFor (o) { return CACHE.get(o); }

export const Mixin = {

	constructor () {
		CACHE.set(this, {});
	}

};
