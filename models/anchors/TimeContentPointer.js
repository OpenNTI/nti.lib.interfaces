import ContentPointer from './ContentPointer';

const VALID_ROLES = ['start', 'end'];

export default class TimeContentPointer extends ContentPointer {

	constructor (service, parent, data) {
		super(service, parent, data);

		this.seconds = parseInt(this.seconds, 10);

		this.validateRole(this.role);
	}

	getRole() { return this.role; }
	getSeconds() { return this.seconds; }

	validateRole (r) {
		if (!r) {
			throw new Error('Must supply a role');
		}
		else if (!VALID_ROLES.includes(r)) {
			throw new Error('Role must be of the value ' + VALID_ROLES.join(',') + ', supplied ' + r);
		}
	}
}
