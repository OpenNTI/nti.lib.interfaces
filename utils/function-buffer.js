/**
 * Waits a short amount of time before invoking a function. If called again before the timeout,
 * the timeout is canceled and recreated.
 *
 * @param {number} time Time in milliseconds to wait before invoking the function.
 * @param {function} fn the function to execute.
 * @returns {void}
 */
export default function buffer(time, fn) {
	let id = null;
	return function () { //must be a regular function (not an arrow function)
		clearTimeout(id);
		id = setTimeout(fn.call(this), time);
	};
}
