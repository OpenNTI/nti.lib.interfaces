/* eslint-env jest */
import mixin from '../AdministrativeIdentity.js';

describe('AdministrativeIdentity Mixin', () => {
	test('should define isAdministrative = true', () => {
		expect(mixin(class {}).prototype.isAdministrative).toBe(true);
	});

	test('isAdministrative should be readonly', () => {
		expect(
			() => (mixin(class {}).prototype.isAdministrative = false)
		).toThrow();
	});
});
