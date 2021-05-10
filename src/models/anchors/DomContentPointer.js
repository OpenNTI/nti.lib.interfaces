import Registry, { COMMON_PREFIX } from '../Registry.js';

import ContentPointer from './ContentPointer.js';

const VALID_ROLES = ['start', 'end', 'ancestor'];

export default class DomContentPointer extends ContentPointer {
	static MimeType = COMMON_PREFIX + 'contentrange.domcontentpointer';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		role: { type: 'string' }
	}

	constructor(service, parent, data) {
		super(service, parent, data);
		this.validateRole(this.role);
	}

	getRole() {
		return this.role;
	}

	validateRole(r) {
		if (!r) {
			throw new Error('Must supply a role');
		} else if (!VALID_ROLES.includes(r)) {
			throw new Error(
				'Role must be of the value ' +
					VALID_ROLES.join(',') +
					', supplied ' +
					r
			);
		}
	}

	locateRangePointInAncestor() {
		return { confidence: 0, node: null };
	}
}

Registry.register(DomContentPointer);
