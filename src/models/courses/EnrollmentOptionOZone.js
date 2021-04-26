import Registry, { COMMON_PREFIX } from '../Registry.js';

import EnrollmentOption from './EnrollmentOption.js';

export default class EnrollmentOptionOZone extends EnrollmentOption {
	static MimeType = COMMON_PREFIX + 'courseware.ozoneenrollmentoption';
}

Registry.register(EnrollmentOptionOZone);
