import {model, COMMON_PREFIX} from '../Registry';

import EnrollmentOption from './EnrollmentOption';

@model
export default class EnrollmentOptionOZone extends EnrollmentOption {
	static MimeType = COMMON_PREFIX + 'courseware.ozoneenrollmentoption'

	constructor (service, parent, data) {
		super(service, parent, data);
	}
}
