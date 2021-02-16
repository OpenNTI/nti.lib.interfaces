import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry';
import Base from '../Base';

class CatalogInstructorLegacyInfo extends Base {
	static MimeType =
		COMMON_PREFIX + 'courses.coursecataloginstructorlegacyinfo';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'JobTitle':     { type: 'string' },
		'Name':         { type: 'string' },
		'Suffix':       { type: 'string' },
		'Title':        { type: 'string' },
		'defaultphoto': { type: 'string' },
		'username':     { type: 'string' },
	}
}

export default decorate(CatalogInstructorLegacyInfo, { with: [model] });
