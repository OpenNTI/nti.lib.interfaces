// import {model, COMMON_PREFIX} from './Registry.js';
import WorkspaceCollection from './WorkspaceCollection.js';
import Registry from './Registry.js';

export default class CourseCollection extends WorkspaceCollection {
	static MimeType = super.computeMimeType('courses');

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'CourseCatalog': { type: 'model' },
	}
}

Registry.register(CourseCollection);
