import {model, COMMON_PREFIX} from '../Registry';

import EnrollmentOption from './EnrollmentOption';

export default
@model
class EnrollmentOptionExternal extends EnrollmentOption {
	static MimeType = [
		COMMON_PREFIX + 'courseware.externalenrollmentoption',
		COMMON_PREFIX + 'courseware.ensyncimisexternalenrollmentoption'
	];

	static Fields = {
		...EnrollmentOption.Fields,
		'enrollment_url':  { type: 'string', name: 'enrollmentURL' }
	}
}
