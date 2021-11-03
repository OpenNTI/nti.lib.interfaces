import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

export default class EducationalExperience extends Base {
	static MimeType = [
		COMMON_PREFIX + 'profile.educationalexperience',
		COMMON_PREFIX + 'profile.educationalexperiance', //is this misspelling still used?
	];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'degree':      { type: 'string'                 },
		'description': { type: 'string'                 },
		'endYear':     { type: 'number'                 },
		'school':      { type: 'string', required: true },
		'startYear':   { type: 'number'                 },
	};
}

Registry.register(EducationalExperience);
