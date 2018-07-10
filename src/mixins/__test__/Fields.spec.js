/* eslint-env jest */
import diff from 'jest-diff'; //eslint-disable-line
import {mixin} from '@nti/lib-decorators';
import Logger from '@nti/util-logger';

import Fields, {IsFieldSet} from '../Fields';

const logger = Logger.get('mixins:Fields');

expect.extend({
	toEqualFields (received, expected) {
		const {expand, utils} = this;
		// const r = {...FieldSet, ...received};
		const e = {[IsFieldSet]: true, ...expected};
		const pass = this.equals(received, e);

		const message = pass
			? () =>
				utils.matcherHint('.not.toEqualFields') +
				'\n\n' +
				'Expected value to not be:\n' +
				`  ${utils.printExpected(e)}\n` +
				'Received:\n' +
				`  ${utils.printReceived(received)}`
			: () => {
				const diffString = diff(e, received, {expand});
				return (
					utils.matcherHint('.toEqualFields') +
					'\n\n' +
					'Expected value to be:\n' +
					`  ${utils.printExpected(e)}\n` +
					'Received:\n' +
					`  ${utils.printReceived(received)}` +
					(diffString ? `\n\nDifference:\n\n${diffString}` : '')
				);
			};

		return {actual: received, message, pass};
	},
});

describe('Fields Mixin', () => {

	afterEach(() => {
		jest.restoreAllMocks();
	});

	test ('Fields do not automatically combine on subclass', () => {
		jest.spyOn(logger, 'debug').mockImplementation(() => {});

		@mixin(Fields)
		class Foo {
			static Fields = {
				'foo': {type: 'string'}
			}

			constructor () {
				this.initMixins({});
			}
		}

		expect(Foo.Fields).toEqualFields({
			foo: {type: 'string'},
		});
		expect(() => new Foo).not.toThrow();

		class Bar extends Foo {
			static Fields = {
				'bar': {type: 'string'}
			}
		}


		expect(Foo.Fields).toEqualFields({
			foo: {type: 'string'},
		});

		expect(Bar.Fields).toEqual({
			bar: {type: 'string'},
		});

		expect(Bar.Fields).not.toEqualFields({
			bar: {type: 'string'},
		});

		expect(() => new Bar).not.toThrow();

		expect(logger.debug).toHaveBeenCalledWith('Model "%s" has not included the base Fields', 'Bar');
	});

	test ('Fields do not log if you spread the base...', () => {
		jest.spyOn(logger, 'debug').mockImplementation(() => {});

		@mixin(Fields)
		class Foo {
			static Fields = {
				'foo': {type: 'string'}
			}

			constructor () {
				this.initMixins({});
			}
		}

		class Bar extends Foo {
			static Fields = {
				...Foo.Fields,
				'bar': {type: 'string'}
			}
		}

		expect(Foo.Fields).toEqualFields({
			foo: {type: 'string'},
		});

		expect(Bar.Fields).toEqualFields({
			bar: {type: 'string'},
			foo: {type: 'string'},
		});

		expect(() => new Bar).not.toThrow();

		expect(logger.debug).not.toHaveBeenCalledWith('Model "%s" has not included the base Fields', 'Bar');
	});

	test ('Fields do not Combine when assigned', () => {

		function TypeA (t) {
			t.Fields = {
				...t.Fields,
				typeA: {type: 'string'}
			};
		}

		function TypeB (t) {
			t.Fields = {
				...t.Fields,
				typeB: {type: 'string'}
			};
		}

		function TypeC (t) {
			t.Fields = {
				typeC: {type: 'string'}
			};
		}

		@mixin(Fields)
		class Foo {
			static Fields = {
				'foo': {type: 'string'}
			}
		}

		@mixin(TypeA)
		class Bar extends Foo {}

		@mixin(TypeA, TypeB)
		class Baz extends Foo {}

		@mixin(TypeC)
		class NoBaseFields extends Foo {}


		expect(Foo.Fields).toEqualFields({
			foo: {type: 'string'},
		});

		expect(Bar.Fields).toEqualFields({
			foo: {type: 'string'},
			typeA: {type: 'string'},
		});

		expect(Baz.Fields).toEqualFields({
			foo: {type: 'string'},
			typeA: {type: 'string'},
			typeB: {type: 'string'},
		});

		expect(NoBaseFields.Fields).toEqual({
			typeC: {type: 'string'},
		});
	});

	test ('Fields Override', () => {

		@mixin(Fields)
		class Foo {
			static Fields = {
				'foo': {type: 'string'}
			}
		}

		class Bar extends Foo {
			static Fields = {
				...Foo.Fields,
				'foo': {type: 'boolean'}
			}
		}


		expect(Foo.Fields).toEqualFields({
			foo: {type: 'string'},
		});

		expect(Bar.Fields).toEqualFields({
			foo: {type: 'boolean'},
		});
	});

	test('Fields use defaultValue', () => {

		@mixin(Fields)
		class Foo {
			static Fields = {
				'foo': {type: 'string', defaultValue: 'bar'}
			}
			constructor (data) {
				this.initMixins(data);
			}
		}


		expect(new Foo({foo: 'baz'}).foo).toBe('baz');
		expect(new Foo().foo).toBe('bar');
	});

	test('Fields: empty model[] use defaultValue', () => {

		@mixin(Fields)
		class Foo {
			static Fields = {
				'foo': {type: 'model[]', defaultValue: []}
			}
			constructor (data) {
				this.initMixins(data);
			}
		}

		expect(new Foo().foo).toEqual([]);
	});

	describe('Fields validate types', () => {

		test ('string', () => {

			@mixin(Fields)
			class Foo {
				static Fields = {
					'foo': {type: 'string'}
				}
				constructor (data) {
					this.initMixins(data);
				}
			}

			jest.spyOn(logger, 'error').mockImplementation(() => {});
			expect(() => new Foo({foo: 'baz'})).not.toThrow();
			expect(() => new Foo({foo: true})).toThrow('Expected a string type for foo but got boolean');
		});

		test ('boolean', () => {

			@mixin(Fields)
			class Foo {
				static Fields = {
					'foo': {type: 'boolean'}
				}
				constructor (data) {
					this.initMixins(data);
				}
			}

			jest.spyOn(logger, 'error').mockImplementation(() => {});
			expect(() => new Foo({foo: true})).not.toThrow();
			expect(() => new Foo({foo: false})).not.toThrow();
			expect(() => new Foo({foo: 'baz'})).toThrow('Expected a boolean type for foo but got string');
		});

		test ('number', () => {

			@mixin(Fields)
			class Foo {
				static Fields = {
					'foo': {type: 'number'}
				}
				constructor (data) {
					this.initMixins(data);
				}
			}

			jest.spyOn(logger, 'error').mockImplementation(() => {});
			expect(() => new Foo({foo: 1})).not.toThrow();
			expect(() => new Foo({foo: 'baz'})).toThrow('Expected a number type for foo but got string');
		});

		test ('object', () => {

			@mixin(Fields)
			class Foo {
				static Fields = {
					'foo': {type: 'object'}
				}
				constructor (data) {
					this.initMixins(data);
				}
			}

			jest.spyOn(logger, 'error').mockImplementation(() => {});
			expect(() => new Foo({foo: {}})).not.toThrow();
			expect(() => new Foo({foo: 'baz'})).toThrow('Expected a object type for foo but got string');
		});
	});

	test('Fields can set alternate name', () => {

		@mixin(Fields)
		class Foo {
			static Fields = {
				'foo': {type: 'string', name: 'bax'}
			}
			constructor (data) {
				this.initMixins(data);
			}
		}


		const f = new Foo({foo: 'bar'});
		expect(f.bax).toBe('bar');
		jest.spyOn(logger, 'error').mockImplementation(() => {});
		expect(() => f.foo).not.toThrow();
		expect(logger.error).toHaveBeenCalledWith(expect.stringMatching(/Access to foo is deprecated./));
	});

	test('Fields can set alternate name and shadow', () => {

		@mixin(Fields)
		class Foo {
			static Fields = {
				'foo': {type: 'string', name: 'bax'}
			}
			constructor (data) {
				this.initMixins(data);
			}
		}


		jest.spyOn(logger, 'error').mockImplementation(() => {});
		jest.spyOn(logger, 'debug').mockImplementation(() => {});
		const f = new Foo({foo: 'bar', bax: 'ignored'});
		expect(f.bax).toBe('bar');
		expect(() => f.foo).not.toThrow();
		expect(logger.debug).toHaveBeenCalledWith(
			expect.stringMatching(/declares a field "%s" but it shadows another./),
			'Foo',
			'bax',
			expect.any(Object)
		);
	});

	describe('Fields validate types', () => {
		@mixin(Fields)
		class Foo {
			static Fields = {
				'field1': {type: 'number?'}
			}
			constructor (data) {
				this.initMixins(data);
			}
		}

		test('Coerce number from string', () => {
			const asString = new Foo({field1: '25'});
			expect(asString.field1).toBe(25);
		});

		test('Coerce number from number', () => {
			const asNumber = new Foo({field1: 35});
			expect(asNumber.field1).toBe(35);
		});

		test('Coerce number from null', () => {
			const asNull = new Foo({field1: null});
			expect(asNull.field1).toBe(null);
		});

		test('Coerce number from undefined', () => {
			const asUndefined = new Foo({});
			expect(asUndefined.field1).toBe(undefined);
		});
	});

	describe('Fields validate types', () => {
		@mixin(Fields)
		class Foo {
			static Fields = {
				'field1': {type: 'string?'}
			}
			constructor (data) {
				this.initMixins(data);
			}
		}

		test('Coerce string from string', () => {
			const asString = new Foo({field1: 'a string'});
			expect(asString.field1).toBe('a string');
		});

		test('Coerce string from number', () => {
			const asNumber = new Foo({field1: 25});
			expect(asNumber.field1).toBe('25');
		});

		test('Coerce string from null', () => {
			const asNull = new Foo({field1: null});
			expect(asNull.field1).toBe(null);
		});

		test('Coerce string from undefined', () => {
			const asUndefined = new Foo({});
			expect(asUndefined.field1).toBe(undefined);
		});
	});

	// test('Fields parse models');
	// test('Fields parse model arrays');
	// test('Fields parse model maps');

	// test('Fields allow direct Model types');
	// test('Fields allow functions as types');
});
