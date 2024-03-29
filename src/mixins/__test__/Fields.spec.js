/* eslint-env jest */
import diff from 'jest-diff';

import Logger from '@nti/util-logger';

import JSONValue from '../JSONValue.js';
import Fields, { clone } from '../Fields.js';
import Registry, { COMMON_PREFIX } from '../../models/Registry.js';

const logger = Logger.get('mixins:Fields');

expect.extend({
	toEqualFields(received, expected) {
		const { expand, utils } = this;
		// const r = {...FieldSet, ...received};
		// const expected = {[IsFieldSet]: true, ..._expected};
		const pass = this.equals(received, expected);

		const message = pass
			? () =>
					utils.matcherHint('.not.toEqualFields') +
					'\n\n' +
					'Expected value to not be:\n' +
					`  ${utils.printExpected(expected)}\n` +
					'Received:\n' +
					`  ${utils.printReceived(received)}`
			: () => {
					const diffString = diff(expected, received, { expand });
					return (
						utils.matcherHint('.toEqualFields') +
						'\n\n' +
						'Expected value to be:\n' +
						`  ${utils.printExpected(expected)}\n` +
						'Received:\n' +
						`  ${utils.printReceived(received)}` +
						(diffString ? `\n\nDifference:\n\n${diffString}` : '')
					);
			  };

		return { actual: received, message, pass };
	},
});

describe('Fields Mixin', () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	test('Fields do not automatically combine on subclass', () => {
		jest.spyOn(logger, 'debug').mockImplementation(() => {});

		class Foo extends Fields() {
			static Fields = {
				foo: { type: 'string' },
			};
		}

		expect(Foo.Fields).toEqualFields({
			foo: { type: 'string' },
		});
		expect(() => new Foo()).not.toThrow();

		class Bar extends Foo {
			static Fields = {
				bar: { type: 'string' },
			};
		}

		expect(Foo.Fields).toEqualFields({
			foo: { type: 'string' },
		});

		expect(Bar.Fields).toEqualFields({
			bar: { type: 'string' },
		});

		expect(() => new Bar()).not.toThrow();
	});

	test('Fields do not log if you spread the base...', () => {
		jest.spyOn(logger, 'debug').mockImplementation(() => {});

		class Foo extends Fields() {
			static Fields = {
				foo: { type: 'string' },
			};
		}

		class Bar extends Foo {
			static Fields = {
				...Foo.Fields,
				bar: { type: 'string' },
			};
		}

		expect(Foo.Fields).toEqualFields({
			foo: { type: 'string' },
		});

		expect(Bar.Fields).toEqualFields({
			bar: { type: 'string' },
			foo: { type: 'string' },
		});

		expect(() => new Bar()).not.toThrow();
	});

	test('Fields do not Combine when assigned', () => {
		const TypeA = t =>
			class extends t {
				static Fields = {
					...super.Fields,
					typeA: { type: 'string' },
				};
			};

		const TypeB = t =>
			class extends t {
				static Fields = {
					...super.Fields,
					typeB: { type: 'string' },
				};
			};

		const TypeC = t =>
			class extends t {
				static Fields = {
					typeC: { type: 'string' },
				};
			};

		class Foo extends Fields() {
			static Fields = {
				foo: { type: 'string' },
			};
		}

		const Bar = TypeA(class Bar extends Foo {});
		const Baz = TypeA(TypeB(class Baz extends Foo {}));
		const NoBaseFields = TypeC(class NoBaseFields extends Foo {});

		expect(Foo.Fields).toEqualFields({
			foo: { type: 'string' },
		});

		expect(Bar.Fields).toEqualFields({
			foo: { type: 'string' },
			typeA: { type: 'string' },
		});

		expect(Baz.Fields).toEqualFields({
			foo: { type: 'string' },
			typeA: { type: 'string' },
			typeB: { type: 'string' },
		});

		expect(NoBaseFields.Fields).toEqual({
			typeC: { type: 'string' },
		});
	});

	test('Fields Override', () => {
		class Foo extends Fields() {
			static Fields = {
				foo: { type: 'string' },
			};
		}

		class Bar extends Foo {
			static Fields = {
				...Foo.Fields,
				foo: { type: 'boolean' },
			};
		}

		expect(Foo.Fields).toEqualFields({
			foo: { type: 'string' },
		});

		expect(Bar.Fields).toEqualFields({
			foo: { type: 'boolean' },
		});
	});

	test('Fields use defaultValue', () => {
		class Foo extends Fields() {
			static Fields = {
				foo: { type: 'string', defaultValue: 'bar' },
			};
		}

		expect(new Foo({ foo: 'baz' }).foo).toBe('baz');
		expect(new Foo().foo).toBe('bar');
	});

	test('Fields: empty model[] use defaultValue', () => {
		class Foo extends Fields() {
			static Fields = {
				foo: { type: 'model[]', defaultValue: [] },
			};
		}

		expect(new Foo().foo).toEqual([]);
	});

	describe('Fields validate types', () => {
		test('string', () => {
			class Foo extends Fields() {
				static Fields = {
					foo: { type: 'string' },
				};
			}

			jest.spyOn(logger, 'error').mockImplementation(() => {});
			expect(() => new Foo({ foo: 'baz' })).not.toThrow();
			expect(() => new Foo({ foo: true })).toThrow(
				'Expected a string type for foo but got boolean'
			);
		});

		test('boolean', () => {
			class Foo extends Fields() {
				static Fields = {
					foo: { type: 'boolean' },
				};
			}

			jest.spyOn(logger, 'error').mockImplementation(() => {});
			expect(() => new Foo({ foo: true })).not.toThrow();
			expect(() => new Foo({ foo: false })).not.toThrow();
			expect(() => new Foo({ foo: 'baz' })).toThrow(
				'Expected a boolean type for foo but got string'
			);
		});

		test('number', () => {
			class Foo extends Fields() {
				static Fields = {
					foo: { type: 'number' },
				};
			}

			jest.spyOn(logger, 'error').mockImplementation(() => {});
			expect(() => new Foo({ foo: 1 })).not.toThrow();
			expect(() => new Foo({ foo: 'baz' })).toThrow(
				'Expected a number type for foo but got string'
			);
		});

		test('object', () => {
			class Foo extends Fields() {
				static Fields = {
					foo: { type: 'object' },
				};
			}

			jest.spyOn(logger, 'error').mockImplementation(() => {});
			expect(() => new Foo({ foo: {} })).not.toThrow();
			expect(() => new Foo({ foo: 'baz' })).toThrow(
				'Expected a object type for foo but got string'
			);
		});
	});

	test('Fields can set alternate name', () => {
		class Foo extends Fields() {
			static Fields = {
				foo: { type: 'string', name: 'bax' },
			};
		}

		const f = new Foo({ foo: 'bar' });
		expect(f.bax).toBe('bar');
		jest.spyOn(logger, 'error').mockImplementation(() => {});
		expect(() => f.foo).not.toThrow();
		expect(logger.error).toHaveBeenCalledWith(
			expect.stringMatching(/Access to foo is deprecated./)
		);
	});

	test('Fields can set alternate name and shadow', () => {
		class Foo extends Fields() {
			static Fields = {
				foo: { type: 'string', name: 'bax' },
			};
		}

		jest.spyOn(logger, 'error').mockImplementation(() => {});
		jest.spyOn(logger, 'debug').mockImplementation(() => {});
		jest.spyOn(logger, 'trace').mockImplementation(() => {});
		const f = new Foo({ foo: 'bar', bax: 'ignored' });
		expect(f.bax).toBe('bar');
		expect(() => f.foo).not.toThrow();
		expect(logger.trace).toHaveBeenCalledWith(
			expect.stringMatching(
				/declares a field "%s" but it shadows another./
			),
			'Foo',
			'bax',
			expect.any(Object)
		);
	});

	describe('Fields validate types', () => {
		class Foo extends Fields() {
			static Fields = {
				field1: { type: 'number?' },
			};
		}

		test('Coerce number from string', () => {
			const asString = new Foo({ field1: '25' });
			expect(asString.field1).toBe(25);
		});

		test('Coerce number from number', () => {
			const asNumber = new Foo({ field1: 35 });
			expect(asNumber.field1).toBe(35);
		});

		test('Coerce number from null', () => {
			const asNull = new Foo({ field1: null });
			expect(asNull.field1).toBe(null);
		});

		test('Coerce number from undefined', () => {
			const asUndefined = new Foo({});
			expect(asUndefined.field1).toBe(undefined);
		});
	});

	describe('Fields validate types', () => {
		class Foo extends Fields() {
			static Fields = {
				field1: { type: 'string?' },
			};
		}

		test('Coerce string from string', () => {
			const asString = new Foo({ field1: 'a string' });
			expect(asString.field1).toBe('a string');
		});

		test('Coerce string from number', () => {
			const asNumber = new Foo({ field1: 25 });
			expect(asNumber.field1).toBe('25');
		});

		test('Coerce string from null', () => {
			const asNull = new Foo({ field1: null });
			expect(asNull.field1).toBe(null);
		});

		test('Coerce string from undefined', () => {
			const asUndefined = new Foo({});
			expect(asUndefined.field1).toBe(undefined);
		});
	});

	describe('Clone Cases', () => {
		test('Empty Object', () => {
			const obj = {};
			expect(clone(obj)).toEqual({});
		});

		test('Primitive Values', () => {
			const obj = {
				date: new Date('2018-10-05'),
				number: 34,
				name: 'John',
				isTrue: true,
			};
			expect(clone(obj)).toEqual(obj);
			expect(clone(obj)).not.toEqual({
				date: new Date('2018-10-06'),
				number: 43,
				name: 'Jake',
				isTrue: false,
			});
		});

		test('Arrays', () => {
			const obj = { test: ['test1', 'test2', 'test2'] };
			expect(clone(obj)).toEqual(obj);
		});

		test('Objects', () => {
			const obj = {
				attributes: { strength: 1, agility: 2 },
				name: 'John',
				perks: { sneak: true, combat: ['hand-to-hand', 'archery'] },
			};
			expect(clone(obj)).toEqual(obj);
		});

		test('Throw Error: Parse Twice', () => {
			class Foo extends Fields() {
				static Fields = {
					Items: { type: 'model[]', defaultValue: [] },
				};
			}

			class HighLight {
				static Fields = {
					fieldA: { type: 'string' },
				};
			}

			const Items = [
				new HighLight({ fieldA: 'test 1' }),
				new HighLight({ fieldA: 'test 2' }),
			];
			const clonedFoo = clone(new Foo({ Items }));
			expect(clonedFoo.Items).toEqual(Items);
		});
	});

	describe('Class getters/setters', () => {
		const value = {
			initial: 'initial value',
			changed: 'changed value',
		};

		const getter = jest.fn();
		const setter = jest.fn();

		beforeEach(() => getter.mockReturnValue(value.initial));

		class Foo extends Fields() {
			static Fields = {
				NTIID: { type: 'string' },
				field1: { type: 'string' },
				field2: { type: 'string' },
				field3: { type: 'string' },
			};
			get field1() {
				return getter();
			}
			set field1(v) {
				setter();
				getter.mockReturnValue(v);
			}

			get field3() {
				return 'constant value';
			}

			static make = data =>
				new Foo({
					field1: 'test',
					field2: value.initial,
					field3: 'not this',
					...data,
				});
		}

		test('Preserves class getter', () => {
			const f = Foo.make();
			const { field1, field2, field3 } = f;
			expect(getter).toHaveBeenCalled();
			expect(field1).toEqual('test');
			expect(field2).toEqual(value.initial);
			expect(field3).toEqual('constant value');
		});

		test('Preserves class setter', () => {
			const f = Foo.make();
			expect(f.field1).toEqual('test');
			expect(f.field2).toEqual(value.initial);
			expect(f.field3).toEqual('constant value');

			f.field1 = value.changed;
			expect(setter).toHaveBeenCalled();
			expect(f.field1).toEqual(value.changed);
			expect(f.field2).toEqual(value.initial);
			expect(f.field3).toEqual('constant value');
		});

		test('Refresh applies fields as expected', () => {
			const f = Foo.make({ NTIID: 'tag:nextthought.com,2011-10:foo' });
			expect(f.field1).toEqual('test');
			expect(f.field2).toEqual(value.initial);
			expect(f.field3).toEqual('constant value');

			f.applyRefreshedData({
				NTIID: 'tag:nextthought.com,2011-10:foo',
				field1: 'test1',
				field2: value.changed,
				field3: 'new',
			});

			expect(setter).toHaveBeenCalled();
			expect(f.field1).toEqual('test1');
			expect(f.field2).toEqual(value.changed);
			expect(f.field3).toEqual('constant value');
		});
	});

	describe.only('dirty checks', () => {
		const MimeType = COMMON_PREFIX + 'dirty';

		Registry.register(
			class Dirty extends Fields(JSONValue()) {
				static MimeType = MimeType;
				static Fields = {
					wut: { type: 'string' },
				};
			}
		);
		class Dummy extends Fields(JSONValue()) {
			static MimeType = MimeType + '.dummy';
			static Fields = {
				field1: { type: 'string' },
				field2: { type: 'string[]' },
				field3: { type: 'model[]' },
				field4: { type: 'model{}' },
			};

			static make = data =>
				new Dummy({
					MimeType: this.MimeType,
					field1: 'test',
					field2: ['abc'],
					field3: [{ MimeType }],
					field4: { foo: { MimeType } },
					...data,
				});
		}

		test('Starts not dirty', () => {
			const d = Dummy.make();
			expect(d.__isDirty()).toBe(false);
		});

		test('Becomes dirty: change literal', () => {
			const d = Dummy.make();
			d.field1 = '1';
			expect(d.__isDirty()).toBe(true);
		});

		test('Becomes dirty: change array item', () => {
			const d = Dummy.make();
			d.field2[0] = '1';
			expect(d.__isDirty()).toBe(true);
		});

		test('Becomes dirty: change modeled array item', () => {
			const d = Dummy.make();
			d.field3[0].wut = '1';

			d.junk = 'boo'; // not declared
			expect(d.toJSON()).not.toHaveProperty('junk');
			expect(d.__isDirty()).toBe(true);
		});

		test('Becomes dirty: change modeled dict item', () => {
			const d = Dummy.make();
			expect(d.__isDirty()).toBe(false);

			d.field4.foo.wut = 'idk';

			expect(d.__isDirty()).toBe(true);
		});

		test('Becomes dirty: change modeled dict key', () => {
			const d = Dummy.make();
			expect(d.__isDirty()).toBe(false);

			d.field4.wut = 'noo';

			expect(d.__isDirty()).toBe(true);
		});
	});

	// test('Fields parse models');
	// test('Fields parse model arrays');
	// test('Fields parse model maps');

	// test('Fields allow direct Model types');
	// test('Fields allow functions as types');
});
