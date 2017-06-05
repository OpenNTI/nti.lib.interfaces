import mixin from '../EnrollmentIdentity';

describe('EnrollmentIdentity Mixin', () => {

	test('should define isEnrollment = true', () =>{
		expect(mixin.isEnrollment).toBe(true);
	});

	test('isEnrollment should be readonly', () => {
		expect(() => mixin.isEnrollment = false).toThrow();
	});

});
