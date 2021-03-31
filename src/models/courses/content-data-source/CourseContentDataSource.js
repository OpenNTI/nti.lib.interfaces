import PagedDataSource from '../../../data-sources/PagedDataSource.js';

import ByLesson from './CourseContentByLessonDataSource.js';

export default class CourseContentDataSource extends PagedDataSource {
	constructor(service, parent) {
		super(service, parent);

		this.handlers = {
			sort: {
				'by-lesson': new ByLesson(service, parent),
			},
		};
	}

	requestPage() {
		//TODO: fill this out
	}
}
