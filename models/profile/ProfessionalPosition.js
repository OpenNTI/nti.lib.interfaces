import Base from '../Base';

export default class ProfessionalPosition extends Base {

	constructor (service, parent, data) {
		super(service, parent, data);

		this.ensureProperty('companyName', true, 'string');
		this.ensureProperty('description', false, 'string');
		this.ensureProperty('endYear', false, 'number');
		this.ensureProperty('startYear', false, 'number');
		this.ensureProperty('title', false, 'string');
	}
}
