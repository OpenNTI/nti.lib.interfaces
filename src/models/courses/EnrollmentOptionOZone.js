import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry';

import EnrollmentOption from './EnrollmentOption';

class EnrollmentOptionOZone extends EnrollmentOption {
	static MimeType = COMMON_PREFIX + 'courseware.ozoneenrollmentoption';
}

export default decorate(EnrollmentOptionOZone, { with: [model] });
