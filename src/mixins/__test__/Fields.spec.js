/* eslint-env jest */
import {mixin} from 'nti-lib-decorators';
import Logger from 'nti-util-logger';

import Fields from '../Fields';

const logger = Logger.get('mixins:Fields');

describe('Fields Mixin', () => {

	test ('Fields Combine', () => {

		@mixin(Fields)
		class Foo {
			static Fields = {
				'foo': {type: 'string'}
			}
		}

		class Bar extends Foo {
			static Fields = {
				'bar': {type: 'string'}
			}
		}


		expect(Foo.Fields).toEqual({
			foo: {type: 'string'},
		});

		expect(Bar.Fields).toEqual({
			bar: {type: 'string'},
			foo: {type: 'string'},
		});
	});


	test ('Fields Combine (Crazy)', () => {

		function TypeA (t) {
			t.Fields = {
				typeA: {type: 'string'}
			};
		}

		function TypeB (t) {
			t.Fields = {
				typeB: {type: 'string'}
			};
		}

		@mixin(Fields)
		class Foo {
			static Fields = {
				'foo': {type: 'string'}
			}
		}

		@mixin(TypeA, TypeB)
		class Bar extends Foo {}


		expect(Foo.Fields).toEqual({
			foo: {type: 'string'},
		});

		expect(Bar.Fields).toEqual({
			typeA: {type: 'string'},
			typeB: {type: 'string'},
			foo: {type: 'string'},
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
				'foo': {type: 'boolean'}
			}
		}


		expect(Foo.Fields).toEqual({
			foo: {type: 'string'},
		});

		expect(Bar.Fields).toEqual({
			foo: {type: 'boolean'},
		});
	});

	test('Feilds use defaultValue', () => {

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

	test('Feilds: empty model[] use defaultValue', () => {

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

	describe('Feilds validate types', () => {

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


			expect(() => new Foo({foo: {}})).not.toThrow();
			expect(() => new Foo({foo: 'baz'})).toThrow('Expected a object type for foo but got string');
		});
	});

	test('Feilds can set alternate name', () => {

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

	test('Feilds parse models');
	test('Feilds parse model arrays');
	test('Feilds parse model maps');

	test('Feilds allow direct Model types');
	test('Feilds allow functions as types');
});
