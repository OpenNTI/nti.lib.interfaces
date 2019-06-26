import Task from './Task';

export default function createPollTask (poll, interval, stepOff = 0) {
	if (!poll || typeof poll !== 'function') { throw new Error('No poll'); }
	
	return new Task (
		(task) => {
			const resolve = (...args) => task.resolve(...args);
			const reject = (...args) => task.reject(...args);

			let stopped = false;
			let iterations = 0;

			const doPoll = () => {
				setTimeout(() => {
					if (stopped) { return; }

					iterations += 1;

					poll(doPoll, resolve, reject);

				}, interval + (stepOff * iterations));
			};

			doPoll();

			return {
				cancel: () => {
					stopped = true;
				}
			};
		}
	);
}