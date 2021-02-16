import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry';
import Base from '../Base';

class EducationalExperience extends Base {
	static MimeType = [
		COMMON_PREFIX + 'profile.educationalexperience',
		COMMON_PREFIX + 'profile.educationalexperiance', //is this misspelling still used?
	];

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'degree':      { type: 'string'                 },
		'description': { type: 'string'                 },
		'endYear':     { type: 'number'                 },
		'school':      { type: 'string', required: true },
		'startYear':   { type: 'number'                 },
	}
}

export default decorate(EducationalExperience, { with: [model] });
