import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

class SharingScopes extends Base {
	static MimeType = [
		COMMON_PREFIX + 'courseinstancesharingscopes',
		COMMON_PREFIX + 'courses.courseinstancesharingscopes'
	]

	static Fields = {
		...Base.Fields,
		'DefaultSharingScopeNTIID': { type: 'string'  },
		'Items':                    { type: 'model{}' },
	}


	get defaultScope () {
		return this.getScopeForId(this.defaultScopeId);
	}


	get defaultScopeId () {
		return this.DefaultSharingScopeNTIID;
	}


	containsDefault () {
		return !!this.defaultScope;
	}


	getScope (name) {
		if (/default/i.test(name)) {
			return this.defaultScope;
		}
		return (this.Items || {})[name];
	}


	getScopeForId (id) {
		let items = Object.values(this.Items || {});

		for (let item of items) {
			if (item.getID && item.getID() === id) {
				return item;
			}
		}
	}
}

export default decorate(SharingScopes, {with:[model]});
