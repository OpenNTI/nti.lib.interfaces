import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import EnrollmentOption from './EnrollmentOption.js';

class EnrollmentOptionOZone extends EnrollmentOption {
	static MimeType = COMMON_PREFIX + 'courseware.ozoneenrollmentoption';
}

export default decorate(EnrollmentOptionOZone, { with: [model] });
