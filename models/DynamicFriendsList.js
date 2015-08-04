import FriendsList from './FriendsList';
import {Service} from '../CommonSymbols';

export default class DynamicFriendsList extends FriendsList {
	constructor (service, parent, data) {
		super(service, parent, data);
		this.isGroup = true;

		this.ensureProperty('IsDynamicSharing', true, 'boolean', true);
	}


	get isMember () {
		return this.hasLink('my_membership');
	}


	leave () {
		return this[Service].delete(this.getLink('my_membership'))
			.then(() => this.refresh())
			.then(() =>	this.isMember = false)
			.then(() => this.onChange('membership'));
	}


	add () {
		return Promise.reject('Cannot add members to DFL');
	}


	remove () {
		return Promise.reject('Cannot remove members from DFL');
	}


	getActivity (...args) {
		let store = super.getActivity(...args);

		return store;
	}
}
