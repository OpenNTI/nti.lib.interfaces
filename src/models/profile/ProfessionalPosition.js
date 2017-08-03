import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class ProfessionalPosition extends Base {
	static MimeType = COMMON_PREFIX + 'profile.professionalposition'

	constructor (service, parent, data) {
		super(service, parent, data);

		this.ensureProperty('companyName', true, 'string');
		this.ensureProperty('description', false, 'string');
		this.ensureProperty('endYear', false, 'number');
		this.ensureProperty('startYear', false, 'number');
		this.ensureProperty('title', false, 'string');
	}
}
