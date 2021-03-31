/* eslint-env jest */
import Base from '../Base.js';

import MockService from './mock-service.js';

describe('Model: Base Class', () => {
	test('Mixins are mixed in', () => {
		expect(Base.prototype.initMixins).toBeTruthy();

		//Editable mixin
		expect(Base.prototype.save).toBeTruthy();
		expect(Base.prototype.delete).toBeTruthy();
		expect(Base.prototype.canEdit).toBeTruthy();

		//JSONValue
		expect(Base.prototype.toJSON).toBeTruthy();
		expect(Base.prototype.getData).toBeTruthy();

		//Pendability
		expect(Base.prototype.addToPending).toBeTruthy();
		expect(Base.prototype.waitForPending).toBeTruthy();
	});

	test('Mixed in properties are non-enumerable', () => {
		const o = new Base(MockService, null);
		expect(o.initMixins).toBeTruthy();
		expect(o).toHaveProperty('initMixins');

		//Editable mixin
		expect(o.save).toBeTruthy();
		expect(o).toHaveProperty('save');
		expect(o.delete).toBeTruthy();
		expect(o).toHaveProperty('delete');
		expect(o.canEdit).toBeTruthy();
		expect(o).toHaveProperty('canEdit');

		//JSONValue
		expect(o.toJSON).toBeTruthy();
		expect(o).toHaveProperty('toJSON');
		expect(o.getData).toBeTruthy();
		expect(o).toHaveProperty('getData');

		//Pendability
		expect(o.addToPending).toBeTruthy();
		expect(o).toHaveProperty('addToPending');
		expect(o.waitForPending).toBeTruthy();
		expect(o).toHaveProperty('waitForPending');
	});
});
