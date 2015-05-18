import ContentPointer from './ContentPointer';

const VALID_ROLES = [
	'start',
	'end',
	'ancestor'
];

export default class DomContentPointer extends ContentPointer {

	constructor (service, parent, data) {
		super(service, parent, data);
		this.validateRole(this.role);
	}


	getRole () { return this.role; }


	validateRole (r) {
		if (!r) {
			throw new Error('Must supply a role');
		}
		else if (!VALID_ROLES.includes(r)) {
			throw new Error('Role must be of the value ' + VALID_ROLES.join(',') + ', supplied ' + r);
		}
	}


	locateRangePointInAncestor () {
		return {confidence: 0, node: null};
	}
}
