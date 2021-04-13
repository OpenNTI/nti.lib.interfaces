import { CoursesDataSource } from './CoursesDataSource.js';

export class EnrolledCoursesDataSource extends CoursesDataSource {
	constructor(service, options) {
		super(service, 'EnrolledCourses', options);
	}
}
