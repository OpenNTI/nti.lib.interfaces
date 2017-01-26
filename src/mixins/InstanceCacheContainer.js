const CACHE = new WeakMap();

export function getCacheFor (o) { return CACHE.get(o); }

export default {

	constructor () {
		CACHE.set(this, {});
	}

};
