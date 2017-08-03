import {model, COMMON_PREFIX} from '../Registry';

import EnrollmentOption from './EnrollmentOption';

export default
@model
class EnrollmentOptionOZone extends EnrollmentOption {
	static MimeType = COMMON_PREFIX + 'courseware.ozoneenrollmentoption'

	constructor (service, parent, data) {
		super(service, parent, data);
	}
}
