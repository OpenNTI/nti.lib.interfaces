/* eslint-env jest */
import Task from '../Task.js';

describe('Task tests', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	describe('constructors', () => {
		test('throws if no runner given', () => {
			expect(() => {
				const task = new Task(); //eslint-disable-line
			}).toThrow();
		});

		test('throw is no function runner given', () => {
			expect(() => {
				const task = new Task(100); //eslint-disable-line
			}).toThrow();
		});
	});

	describe('running', () => {
		test('calls runner with appropriate task methods', () => {
			let calledWith = null;
			const runner = t => (calledWith = t);
			const task = new Task(runner);

			expect(calledWith).toBeNull();

			task.start();

			expect(calledWith).not.toBeNull();
			expect(typeof calledWith.resolve).toBe('function');
			expect(typeof calledWith.reject).toBe('function');
			expect(typeof calledWith.canRetry).toBe('function');
			expect(typeof calledWith.setProgress).toBe('function');
		});

		test('moves runner into running state and emits state change', () => {
			const task = new Task(() => {});
			const mon = jest.fn();

			expect(task.isStarted).toBeFalsy();
			expect(task.isRunning).toBeFalsy();

			task.addChangeListener(mon);
			expect(mon).not.toHaveBeenCalled();

			task.start();
			jest.runAllTimers();

			expect(mon).toHaveBeenCalled();
			expect(task.isStarted).toBeTruthy();
			expect(task.isRunning).toBeTruthy();
		});

		test('resolving moves the task into the resolved state', () => {
			const task = new Task(({ resolve }) => resolve());
			const mon = jest.fn();

			expect(task.isResolved).toBeFalsy();
			expect(task.isFinished).toBeFalsy();

			task.addChangeListener(mon);
			expect(mon).not.toHaveBeenCalled();

			task.start();
			jest.runAllTimers();

			expect(mon).toHaveBeenCalled();
			expect(task.isResolved).toBeTruthy();
			expect(task.isFinished).toBeTruthy();
		});

		test('rejecting moves the task into the rejected state', () => {
			const task = new Task(({ reject }) => reject());
			const mon = jest.fn();

			expect(task.isRejected).toBeFalsy();
			expect(task.isFinished).toBeFalsy();

			task.addChangeListener(mon);
			expect(mon).not.toHaveBeenCalled();

			task.start();
			jest.runAllTimers();

			expect(mon).toHaveBeenCalled();
			expect(task.isRejected).toBeTruthy();
			expect(task.isFinished).toBeTruthy();
		});

		test('setting progress triggers a change event', () => {
			const task = new Task(({ setProgress }) => setProgress(5, 10));
			const mon = jest.fn();

			expect(task.hasProgress).toBeFalsy();

			task.addChangeListener(mon);
			expect(mon).not.toHaveBeenCalled();

			task.start();
			jest.runAllTimers();

			expect(task.hasProgress).toBeTruthy();
			expect(mon).toHaveBeenCalled();

			const { progress } = task;

			expect(progress.current).toBe(5);
			expect(progress.total).toBe(10);
		});
	});
});
