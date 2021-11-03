import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

export default class CatalogInstructorLegacyInfo extends Base {
	static MimeType =
		COMMON_PREFIX + 'courses.coursecataloginstructorlegacyinfo';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'JobTitle':     { type: 'string' },
		'Name':         { type: 'string' },
		'Suffix':       { type: 'string' },
		'Title':        { type: 'string' },
		'defaultphoto': { type: 'string' },
		'username':     { type: 'string' },
	};
}

Registry.register(CatalogInstructorLegacyInfo);
