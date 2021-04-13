import { CoursesDataSource } from './CoursesDataSource.js';

export class AdministeredCoursesDataSource extends CoursesDataSource {
	constructor(service, options) {
		super(service, 'AdministeredCourses', options);
	}
}
