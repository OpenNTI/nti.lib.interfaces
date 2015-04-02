import isFunction from '../isfunction';

import emptyFunction from '../empty-function';
import emptyFunction2 from '../empty-function';

describe('empty function', ()=> {

	it('should be a function', ()=> {
		expect(emptyFunction).toBeDefined();
		expect(isFunction(emptyFunction)).toBeTruthy();
	});

	it('should be a singleton', ()=> {
		expect(emptyFunction).toBe(emptyFunction2);
	});

	it('should be frozen', ()=> {
		expect(Object.isFrozen(emptyFunction)).toBeTruthy();
	});

	it('should be empty', ()=> {
		let source = emptyFunction.toString();
		let regex = /^function[^{]*\{(.*)\}\s*$/;
		let body = regex.exec(source);

		expect(body).toBeTruthy();
		expect(emptyFunction.length).toBe(0);

		body = body[1];

		expect(typeof body).toBe('string');
		expect(body.replace(/\s*/, '').length).toBe(0);
	});
});
