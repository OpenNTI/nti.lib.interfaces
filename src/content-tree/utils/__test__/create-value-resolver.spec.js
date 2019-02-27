/* eslint-env jest */
import createValueResolver from '../create-value-resolver';

describe('ContentTree createValueResolver', () => {
	test('Resolving a non-function value, echoes the value', async () => {
		const value = {a: 'test-value'};
		const resolver = createValueResolver(value);

		const resolved = await resolver.resolve();

		expect(resolved).toBe(value);
	});

	test('Resolving null values', async () => {
		const value = null;
		const resolver = createValueResolver(value);

		const resolved = await resolver.resolve();

		expect(resolved).toBe(value);
	});

	test('Resolving a value resolver, does NOT create a new resolver', () => {
		const value = createValueResolver('hello');
		const resolver = createValueResolver(value);

		expect(resolver).toBe(value);
	});

	describe('Resolving a function value', () => {
		test('returns the result of the function', async () => {
			const value = {a: 'test-value'};
			const fn = async () => value;
			const resolver = createValueResolver(fn);

			const resolved = await resolver.resolve();

			expect(resolved).toBe(value);
		});

		test('does not call the function more than once', async () => {
			const value = {a: 'test-value'};
			const fn = jest.fn(() => value);
			const resolver = createValueResolver(fn);

			const first = await resolver.resolve();
			const second = await resolver.resolve();

			expect(first).toBe(value);
			expect(second).toBe(value);

			expect(fn).toHaveBeenCalledTimes(1);
		});
	});
});
