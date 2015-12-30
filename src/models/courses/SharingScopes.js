import {Parser as parse} from '../../constants';
import Base from '../Base';

export default class SharingScopes extends Base {

	constructor (service, parent, data) {
		super(service, parent, data);

		for (let scope of Object.keys(this.Items)) {
			this.Items[scope] = this[parse](this.Items[scope]);
		}
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