function reflect(fn, key) {
	let keys = key.split('.');

	return function(...args) {
		//`this` needs to be the object the returned
		// function is injected into, _not_ a job for
		// the arrow function
		let scope = this;
		let path = [];

		//walk down the path...
		for(let i = 0, l = keys.length; i <= l; i++) {
			let key = keys[i];
			if (i < l && scope) {
				scope = scope[key];
				path.push(key);
				if (!scope) {
					console.warn('Property path `%s` does not exist on: %o', path.join('.'), this);
				}
			}
		}

		if (!scope[fn]) {
			let {name} = scope.constructor;
			throw new Error(`Class ${name} does not implement ${fn}`);
		}

		return scope[fn](...args);
	};
}


/**
 * binds functions from the object at the given key so they can be added to an
 * upper object. (ex: map an array's forEach (bound) to the wrapping object)
 *
 * @param  {Array[String]} fns An array of function names to bind and return
 * @param  {String} key The key where the object is at.
 * @return {Object}	Object with function names to bound functions
 */
export default function forwardFunctions(fns, key) {
	let result = {};

	for(let fn of fns) {
		result[fn] = reflect(fn, key);
	}

	return result;
}
