/* eslint-env jest */
import Logger from '@nti/util-logger';

import Registry, { MAP } from '../Registry.js';

const logger = Logger.get('models:Registry');

describe('Model Registry', () => {
	class MOCK {
		static MimeType = 'application/vnd.nextthought.foo';
	}
	class MOCK2 {
		static MimeType = 'application/vnd.nextthought.bar';
	}

	beforeAll(() => {
		jest.spyOn(logger, 'warn').mockImplementation(jest.fn);
	});

	describe('Static API', () => {
		test('register', () => {
			expect(Registry.register).toEqual(expect.any(Function));

			expect(() => Registry.register()).toThrow();
			expect(() => Registry.register(1)).toThrow();
			expect(() => Registry.register('garbage')).toThrow();
			expect(() => Registry.register({})).toThrow();
			expect(() =>
				Registry.register({
					MimeType: 'application/vnd.nextthought.foo',
				})
			).toThrow();

			expect(Registry.register(MOCK)).toBe(MOCK);
			expect(Registry.register(MOCK2)).toBe(MOCK2);

			jest.spyOn(logger, 'warn');
			expect(Registry.register(MOCK)).toBe(MOCK);
			expect(logger.warn).toHaveBeenCalledWith(
				'Overriding Type!! %s with %o was %o',
				'foo',
				MOCK,
				MOCK
			);
		});

		test('alias', () => {
			expect(Registry.alias).toEqual(expect.any(Function));
			expect(() => Registry.alias()).toThrow();
			expect(() => Registry.alias({}, {})).toThrow(
				'aliases and types must be strings'
			);
			expect(() => Registry.alias(1, 2)).toThrow(
				'aliases and types must be strings'
			);
			expect(() => Registry.alias('', {})).toThrow(
				'aliases and types must be strings'
			);
			expect(() => Registry.alias({}, '')).toThrow(
				'aliases and types must be strings'
			);

			jest.spyOn(logger, 'warn');

			expect(() => Registry.alias('cap', 'baz')).toThrow(
				'Cannot alias a non-existing type'
			);
			expect(() => Registry.alias('foo', 'foo')).toThrow(
				'Cannot create an alias that is self-referencing.'
			);
			expect(() => Registry.alias('bar', 'foo')).toThrow(
				'Cannot alias over an existing type.'
			);
			expect(() => Registry.alias('foo', 'baz')).not.toThrow();
			expect(() => Registry.alias('foo', 'baz')).not.toThrow();
			expect(logger.warn).toHaveBeenCalledWith(
				'Overriding Type!! %s with %o was %o',
				'baz',
				'foo',
				'foo'
			);
		});

		test('ignore', () => {
			const r = Registry.getInstance();
			jest.spyOn(r, 'alias');
			expect(Registry.ignore).toEqual(expect.any(Function));
			expect(Registry.ignore('links')).toBeUndefined();
			expect(r.alias).toHaveBeenCalledWith('ignored', 'links');
		});

		test('lookup', () => {
			expect(Registry.lookup).toEqual(expect.any(Function));

			expect(() => Registry.lookup('')).not.toThrow();
			expect(Registry.lookup('')).toBeUndefined();
			expect(() => Registry.lookup({})).toThrow();
			expect(Registry.lookup('application/vnd.nextthought.foo')).toBe(
				MOCK
			);
			expect(Registry.lookup('foo')).toBe(MOCK);
		});
	});

	describe('Instance', () => {
		const registry = new Registry();

		test('Our Test instance is not the static instance', () => {
			expect(Registry.getInstance() instanceof Registry).toBe(true);
			expect(registry instanceof Registry).toBe(true);
			expect(registry).not.toBe(Registry.getInstance());
		});

		test('Instance map is initialized with an ignored key', () => {
			expect(registry[MAP].size).toBe(1);
			expect(registry[MAP].get('ignored')).toBeTruthy();
		});

		test('register', () => {
			expect(registry.register).toEqual(expect.any(Function));

			expect(() => registry.register()).toThrow();
			expect(() => registry.register(1)).toThrow();
			expect(() => registry.register('garbage')).toThrow();
			expect(() => registry.register({})).toThrow();
			expect(() =>
				registry.register({
					MimeType: 'application/vnd.nextthought.foo',
				})
			).toThrow();

			expect(registry.register(MOCK)).toBe(MOCK);
			expect(registry.register(MOCK2)).toBe(MOCK2);

			jest.spyOn(logger, 'warn');
			expect(registry.register(MOCK)).toBe(MOCK);
			expect(logger.warn).toHaveBeenCalledWith(
				'Overriding Type!! %s with %o was %o',
				'foo',
				MOCK,
				MOCK
			);
		});

		test('alias', () => {
			expect(registry.alias).toEqual(expect.any(Function));
			expect(() => registry.alias()).toThrow();
			expect(() => registry.alias({}, {})).toThrow(
				'aliases and types must be strings'
			);
			expect(() => registry.alias(1, 2)).toThrow(
				'aliases and types must be strings'
			);
			expect(() => registry.alias('', {})).toThrow(
				'aliases and types must be strings'
			);
			expect(() => registry.alias({}, '')).toThrow(
				'aliases and types must be strings'
			);

			jest.spyOn(logger, 'warn');

			expect(() => registry.alias('cap', 'baz')).toThrow(
				'Cannot alias a non-existing type'
			);
			expect(() => registry.alias('foo', 'foo')).toThrow(
				'Cannot create an alias that is self-referencing.'
			);
			expect(() => registry.alias('bar', 'foo')).toThrow(
				'Cannot alias over an existing type.'
			);
			expect(() => registry.alias('foo', 'baz')).not.toThrow();
			expect(() => registry.alias('foo', 'baz')).not.toThrow();
			expect(logger.warn).toHaveBeenCalledWith(
				'Overriding Type!! %s with %o was %o',
				'baz',
				'foo',
				'foo'
			);
		});

		test('lookup', () => {
			expect(registry.lookup).toEqual(expect.any(Function));
			expect(() => registry.lookup('')).not.toThrow();
			expect(registry.lookup('')).toBeUndefined();
			expect(() => registry.lookup({})).toThrow();
			expect(registry.lookup('application/vnd.nextthought.foo')).toBe(
				MOCK
			);
			expect(registry.lookup('foo')).toBe(MOCK);

			//setup an alias-loop...
			registry[MAP].set('zab', 'baz');
			registry[MAP].set('baz', 'zaz');
			registry[MAP].set('zaz', 'zab');

			jest.spyOn(logger, 'debug');
			expect(registry.lookup('zab')).toBeUndefined();
			expect(logger.debug).toHaveBeenCalledWith(
				'Alias Loop Detected... already seen: %s\n\t=?> %s',
				'zab\n\t=> baz\n\t=> zaz',
				'zab'
			);
		});
	});
});
