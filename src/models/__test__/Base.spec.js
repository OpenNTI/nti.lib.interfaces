import Base from '../Base';

describe ('Model: Base Class', () => {

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
		const o = new Base({}, null);
		expect(o.initMixins).toBeTruthy();
		expect(o.hasOwnProperty('initMixins')).toBe(false);

		//Editable mixin
		expect(o.save).toBeTruthy();
		expect(o.hasOwnProperty('save')).toBe(false);
		expect(o.delete).toBeTruthy();
		expect(o.hasOwnProperty('delete')).toBe(false);
		expect(o.canEdit).toBeTruthy();
		expect(o.hasOwnProperty('canEdit')).toBe(false);

		//JSONValue
		expect(o.toJSON).toBeTruthy();
		expect(o.hasOwnProperty('toJSON')).toBe(false);
		expect(o.getData).toBeTruthy();
		expect(o.hasOwnProperty('getData')).toBe(false);

		//Pendability
		expect(o.addToPending).toBeTruthy();
		expect(o.hasOwnProperty('addToPending')).toBe(false);
		expect(o.waitForPending).toBeTruthy();
		expect(o.hasOwnProperty('waitForPending')).toBe(false);
	});
});
