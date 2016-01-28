/*eslint no-console:0*/
function reflect (fn, key) {
	let keys = key.split('.');

	return function (...args) {
		//`this` needs to be the object the returned
		// function is injected into, _not_ a job for
		// the arrow function
		let scope = this;
		let path = [];

		//walk down the path...
		for(let i = 0, l = keys.length; i <= l; i++) {
			let k = keys[i];
			if (i < l && scope) {

				if (!scope[k]) {
					let {name} = scope.constructor;
					throw new Error(`Class ${name} does not have property ${k}`);
				}

				scope = scope[k];
				path.push(k);
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
 * @param  {string[]} fns An array of function names to bind and return
 * @param  {string} key The key where the object is at.
 * @returns {object}	Object with function names to bound functions
 */
export default function forwardFunctions (fns, key) {
	let result = {};

	for(let fn of fns) {
		result[fn] = reflect(fn, key);
	}

	return result;
}
