/* eslint-env jest */
import mixin from '../EnrollmentIdentity.js';

describe('EnrollmentIdentity Mixin', () => {
	test('should define isEnrollment = true', () => {
		expect(mixin(class {}).prototype.isEnrollment).toBe(true);
	});

	test('isEnrollment should be readonly', () => {
		expect(
			() => (mixin(class {}).prototype.isEnrollment = false)
		).toThrow();
	});
});
