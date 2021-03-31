/* eslint-env jest */
import mixin from '../EnrollmentIdentity.js';

describe('EnrollmentIdentity Mixin', () => {
	test('should define isEnrollment = true', () => {
		expect(mixin.isEnrollment).toBe(true);
	});

	test('isEnrollment should be readonly', () => {
		expect(() => (mixin.isEnrollment = false)).toThrow();
	});
});
