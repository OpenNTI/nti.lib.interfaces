import {decorate} from '@nti/lib-commons';
import {mixin/*, readonly*/} from '@nti/lib-decorators';

import UserDataStore from '../../stores/UserData';
import {
	REL_RELEVANT_CONTAINED_USER_GENERATED_DATA,
	Service,
} from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

const UserData = Symbol('UserData');

class SlideDeck extends Base {
	[Symbol.iterator] = () => this.Slides[Symbol.iterator]();

	static MimeType = COMMON_PREFIX + 'ntislidedeck'

	static Fields = {
		...Base.Fields,
		'byline': { type: 'string'  },
		'title':  { type: 'string'  },
		'Slides': { type: 'model[]' },
		'Videos': { type: 'model[]' },
	}

	getUserData () {
		let store = this[UserData];
		let service = this[Service];
		let id = this.getID();

		if (!store) {
			store = this[UserData] = new UserDataStore(service, id,
				service.getContainerURL(id, REL_RELEVANT_CONTAINED_USER_GENERATED_DATA));
		}

		return Promise.resolve(store); //in the future, this may need to be async...
	}
}

export default decorate(SlideDeck, {with:[
	model,
	mixin({/*@readonly*/ isSlideDeck: true}),
]});
