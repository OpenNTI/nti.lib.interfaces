/**
 * Waits a short amount of time before invoking a function. If called again before the timeout,
 * the timeout is canceled and recreated.
 *
 * @param {number} time Time in milliseconds to wait before invoking the function.
 * @param {Function} fn the function to execute.
 * @returns {void}
 */
export default function buffer (time, fn) {
	if (typeof time !== 'number') { throw new Error('Illegal Argument: The first argument must be a number'); }
	if (typeof fn !== 'function') { throw new Error('Illegal Argument: The second argument must be a function'); }

	let id = null;
	let f = function () { //must be a regular function (not an arrow function)
		clearTimeout(id);
		let args = arguments;
		id = setTimeout(()=> fn.apply(this, args), time);
	};

	f.buffered = time;

	return f;
}
