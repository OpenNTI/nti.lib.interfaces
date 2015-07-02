
/**
 * Given the first argument is an object, copy the keys passed in the var args to a new object.
 *
 * @param {object} o         The source object to copy from.
 * @param {...string} keys   The keys to copy into a new object from the source object.
 *
 * @return {object} a new object with just the keys specified
 */
export default function pluck(o, ...keys) {
	let out = {};
	for (let key of keys) {
		out[key] = o[key];
	}
	return out;
}
