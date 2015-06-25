import Base from '../Base';

export default class EducationalExperience extends Base {

	static newFrom(data) {
		return new EducationalExperience(null, null, data);
	}

	constructor (service, parent, data) {
		super(service, parent, data);
		this.ensureProperty('school', true, 'string');
		this.ensureProperty('startYear', true, 'numeric');
		this.ensureProperty('endYear', false, 'numeric');
		this.ensureProperty('degree', false, 'string');
		this.ensureProperty('description', false, 'string');
	}
}
