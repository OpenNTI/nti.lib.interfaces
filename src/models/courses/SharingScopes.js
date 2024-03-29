import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

export default class SharingScopes extends Base {
	static MimeType = [
		COMMON_PREFIX + 'courseinstancesharingscopes',
		COMMON_PREFIX + 'courses.courseinstancesharingscopes',
	];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'DefaultSharingScopeNTIID': { type: 'string'  },
		'Items':                    { type: 'model{}' },
	};

	get defaultScope() {
		return this.getScopeForId(this.defaultScopeId);
	}

	get defaultScopeId() {
		return this.DefaultSharingScopeNTIID;
	}

	containsDefault() {
		return !!this.defaultScope;
	}

	getScope(name) {
		if (/default/i.test(name)) {
			return this.defaultScope;
		}
		return (this.Items || {})[name];
	}

	getScopeForId(id) {
		let items = Object.values(this.Items || {});

		for (let item of items) {
			if (item.getID && item.getID() === id) {
				return item;
			}
		}
	}
}

Registry.register(SharingScopes);
