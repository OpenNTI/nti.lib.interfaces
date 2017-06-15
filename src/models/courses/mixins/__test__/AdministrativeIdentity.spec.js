/* eslint-env jest */
import mixin from '../AdministrativeIdentity';

describe('AdministrativeIdentity Mixin', () => {

	test('should define isAdministrative = true', () =>{
		expect(mixin.isAdministrative).toBe(true);
	});

	test('isAdministrative should be readonly', () => {
		expect(() => mixin.isAdministrative = false).toThrow();
	});

});
