import Entity from './Entity';
import {Parser as parse} from '../CommonSymbols';

// import Stream from '../stores/Stream';

export default class FriendsList extends Entity {
	constructor(service, parent, data) {
		super(service, parent, data);
		this.isGroup = data.IsDynamicSharing;
		this[parse]('friends');
	}

	getID () { return this.ID; }
}
