/* eslint-env jest */
import mixin from '../CourseIdentity.js';

describe('CourseIdentity Mixin', () => {
	test('should define isCourse = true', () => {
		expect(mixin(class {}).prototype.isCourse).toBe(true);
	});

	test('isCourse should be readonly', () => {
		expect(() => (mixin(class {}).prototype.isCourse = false)).toThrow();
	});
});
