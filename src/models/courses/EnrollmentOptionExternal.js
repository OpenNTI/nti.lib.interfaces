import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import EnrollmentOption from './EnrollmentOption.js';

class EnrollmentOptionExternal extends EnrollmentOption {
	static MimeType = [
		COMMON_PREFIX + 'courseware.externalenrollmentoption',
		COMMON_PREFIX + 'courseware.ensyncimisexternalenrollmentoption',
	];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'enrollment_url':  { type: 'string', name: 'enrollmentURL' }
	}
}

export default decorate(EnrollmentOptionExternal, [model]);
