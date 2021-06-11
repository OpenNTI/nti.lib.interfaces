import Base from '../Base.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';

export default class CourseCatalogFolder extends Base {
	static MimeType = COMMON_PREFIX + 'courses.coursecatalogfolder';
	// prettier-ignore
	static Fields = {
		...super.Fields,
		'anonymously_accessible': { type: 'boolean' },
	};
}

Registry.register(CourseCatalogFolder);
