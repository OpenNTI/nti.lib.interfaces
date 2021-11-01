import Registry, { COMMON_PREFIX } from '../Registry.js';

import EnrollmentOption from './EnrollmentOption.js';

export default class EnrollmentOptionExternal extends EnrollmentOption {
	static MimeType = [
		COMMON_PREFIX + 'courseware.externalenrollmentoption',
		COMMON_PREFIX + 'courseware.ensyncimisexternalenrollmentoption',
	];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'enrollment_url':  { type: 'string', name: 'enrollmentURL' }
	};
}

Registry.register(EnrollmentOptionExternal);
