export default function callOnceMonitor (name) {
	let called = false;
	let value = null;
	let monitors = [];

	const fn = (...args) => {
		if (called) { throw new Error(`Cannot call ${name || ' this method'} more than once.`); }

		value = args;
		called = true;

		for (let monitor of monitors) {
			monitor(...args);
		}

		monitors = null;
	};

	fn.onceCalled = (monitor) => {
		if (!monitor || typeof monitor !== 'function') { throw new TypeError('Cannot call \'onceCalled\' without a function argument'); }
		
		if (called) {
			monitor(...value);
		} else {
			monitors.push(monitor);
		}
	};

	return fn;
}