import Base from '../Base';

export default class EducationalExperience extends Base {

	constructor (service, parent, data) {
		super(service, parent, data);
		this.ensureProperty('school', true, 'string');
		this.ensureProperty('startYear', false, 'number');
		this.ensureProperty('endYear', false, 'number');
		this.ensureProperty('degree', false, 'string');
		this.ensureProperty('description', false, 'string');
	}
}
