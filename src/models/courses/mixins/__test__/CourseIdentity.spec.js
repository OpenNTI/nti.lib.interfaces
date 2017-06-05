import mixin from '../CourseIdentity';

describe('CourseIdentity Mixin', () => {

	test('should define isCourse = true', () =>{
		expect(mixin.isCourse).toBe(true);
	});

	test('isCourse should be readonly', () => {
		expect(() => mixin.isCourse = false).toThrow();
	});

});
