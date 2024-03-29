import Base from '../Model.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';

export default class CourseCatalogFolder extends Base {
	static MimeType = COMMON_PREFIX + 'courses.coursecatalogfolder';
	// prettier-ignore
	static Fields = {
		...super.Fields,
		'anonymously_accessible': { type: 'boolean', name: 'anonymouslyAccessible' },
	};

	async setAnonymousAccess(anonymouslyAccessible) {
		return this.save({ anonymouslyAccessible });
	}
}

Registry.register(CourseCatalogFolder);
