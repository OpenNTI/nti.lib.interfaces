import Entity from './Entity';

// import Stream from '../stores/Stream';

export default class FriendsList extends Entity {
	constructor(service, parent, data) {
		super(service, parent, data);
		this.isGroup = data.IsDynamicSharing;
	}
}
