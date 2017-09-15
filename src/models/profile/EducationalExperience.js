import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class EducationalExperience extends Base {
	static MimeType = [
		COMMON_PREFIX + 'profile.educationalexperience',
		COMMON_PREFIX + 'profile.educationalexperiance', //is this misspelling still used?
	]

	static Fields = {
		...Base.Fields,
		'degree':      { type: 'string'                 },
		'description': { type: 'string'                 },
		'endYear':     { type: 'number'                 },
		'school':      { type: 'string', required: true },
		'startYear':   { type: 'number'                 },
	}
}
