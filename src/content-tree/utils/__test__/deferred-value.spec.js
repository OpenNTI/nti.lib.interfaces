/* eslint-env jest */
import deferredValue from '../deferred-value';

describe('ContentTree deferredValue', () => {
	test('Resolving a non-function value, echoes the value', async () => {
		const value = {a: 'test-value'};
		const resolver = deferredValue(value);

		const resolved = await resolver.resolve();

		expect(resolved).toBe(value);
	});

	test('Resolving null values', async () => {
		const value = null;
		const resolver = deferredValue(value);

		const resolved = await resolver.resolve();

		expect(resolved).toBe(value);
	});

	test('Resolving a value resolver, does NOT create a new resolver', () => {
		const value = deferredValue('hello');
		const resolver = deferredValue(value);

		expect(resolver).toBe(value);
	});

	describe('Resolving a function value', () => {
		test('returns the result of the function', async () => {
			const value = {a: 'test-value'};
			const fn = async () => value;
			const resolver = deferredValue(fn);

			const resolved = await resolver.resolve();

			expect(resolved).toBe(value);
		});

		test('does not call the function more than once', async () => {
			const value = {a: 'test-value'};
			const fn = jest.fn(() => value);
			const resolver = deferredValue(fn);

			const first = await resolver.resolve();
			const second = await resolver.resolve();

			expect(first).toBe(value);
			expect(second).toBe(value);

			expect(fn).toHaveBeenCalledTimes(1);
		});
	});
});
