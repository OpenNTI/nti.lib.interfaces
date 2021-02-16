/* eslint-env jest */
import callOnceMonitor from '../call-once-monitor';

describe('call-once-monitor tests', () => {
	test('calls monitors when the function is called, with the arguments the function was called with', () => {
		const method = callOnceMonitor();
		const arg1 = 'test1';
		const arg2 = 'test2';

		const monitors = [jest.fn(), jest.fn()];

		for (let monitor of monitors) {
			method.onceCalled(monitor);
			expect(monitor).not.toHaveBeenCalled();
		}

		method(arg1, arg2);

		for (let monitor of monitors) {
			expect(monitor).toHaveBeenCalledWith(arg1, arg2);
		}
	});

	test('calls monitor immediately if the function has already been called', () => {
		const method = callOnceMonitor();
		const arg1 = 'test1';
		const arg2 = 'test 2';

		method(arg1, arg2);

		const monitor = jest.fn();

		method.onceCalled(monitor);

		expect(monitor).toHaveBeenCalledWith(arg1, arg2);
	});

	test('throws if called more than once', () => {
		const method = callOnceMonitor();

		expect(() => {
			method();
			method();
		}).toThrow();
	});
});
