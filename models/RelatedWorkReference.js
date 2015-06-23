import Base from './Base';

import UserDataStore from '../stores/UserData';
import {REL_RELEVANT_USER_GENERATED_DATA} from '../constants';
import {Service} from '../CommonSymbols';

const UserData = Symbol('UserData');

export default class RelatedWorkReference extends Base {
	static fromID (service, id) {
		return new RelatedWorkReference(service, {NTIID: id});
	}

	//Minimum keys required: NTIID. Links preferred.
	constructor (service, data) {
		super(service, null, data);
	}


	getUserData () {
		let store = this[UserData];
		let service = this[Service];
		let id = this.getID();

		if (!store) {
			store = this[UserData] = new UserDataStore(service, id,
				service.getContainerURL(id, REL_RELEVANT_USER_GENERATED_DATA));
		}

		return Promise.resolve(store);//in the future, this may need to be async...
	}
}
