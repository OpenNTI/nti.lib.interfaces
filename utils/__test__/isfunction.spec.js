import isFunction from '../isfunction';

describe('isFunction', ()=> {

	it('should identify a function', ()=> {
		expect(isFunction).toBeDefined();

		expect(isFunction(()=> {})).toBeTruthy();
		expect(isFunction(function() {})).toBeTruthy();

		expect(isFunction()).toBeFalsy();
		expect(isFunction({})).toBeFalsy();
		expect(isFunction(null)).toBeFalsy();
		expect(isFunction(undefined)).toBeFalsy();
		expect(isFunction(1)).toBeFalsy();
		expect(isFunction('a')).toBeFalsy();
		expect(isFunction(false)).toBeFalsy();
	});

});
