import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class EducationalExperience extends Base {
	static MimeType = [
		COMMON_PREFIX + 'profile.educationalexperience',
		COMMON_PREFIX + 'profile.educationalexperiance', //is this misspelling still used?
	]

	constructor (service, parent, data) {
		super(service, parent, data);
		this.ensureProperty('school', true, 'string');
		this.ensureProperty('startYear', false, 'number');
		this.ensureProperty('endYear', false, 'number');
		this.ensureProperty('degree', false, 'string');
		this.ensureProperty('description', false, 'string');
	}
}
