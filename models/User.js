import Entity from './Entity';

import Achievements from '../stores/Achievements';
import Stream from '../stores/Stream';

import { Service, Parser as parse } from '../CommonSymbols';

const ONLY_COMMUNITIES = x => x.isCommunity;


function cleanData(data) {
	let {accepting=[], following=[], ignoring=[]} = data;
	delete data.accepting;
	delete data.following;
	delete data.ignoring;
	delete data.AvatarURLChoices;

	let toID = o => /user/i.test(o.MimeType) ? o.Username : o.NTIID;

	data.Connections = {
		//Drop all exess data, just the ID is needed.
		accepting: accepting.map(toID),
		following: following.map(toID),
		ignoring: ignoring.map(toID)
	};
}


export default class User extends Entity {

	constructor (service, data) {
		cleanData(data);
		super(service, null, data);
		this.isUser = true;

		this[parse]('Communities');
		this[parse]('DynamicMemberships');

		this[parse]('positions');
		this[parse]('education');
	}


	get firstName () { return this.NonI18NFirstName; }
	get lastName () { return this.NonI18NLastName; }


	get initials () {
		let {displayName, firstName, lastName} = this;
		return (firstName && lastName) ? `${firstName[0]}${lastName[0]}` : displayName[0];
	}


	get isAppUser () {
		let appUser = this[Service].getAppUsername();
		return this.getID() === appUser;
	}


	get following () {//do not define a setter.
		let service = this[Service];
		let contacts = service.getContacts();

		if (!contacts) {
			service.waitForPending().then(() => this.onChange('following'));
		}

		return contacts && contacts.contains(this, false);
	}


	/**
	 * Toggles the state of following.
	 *
	 * @return {[type]} [description]
	 */
	follow () {
		let contacts = this[Service].getContacts();
		if (!contacts) {
			return Promise.reject('Not Ready, no Contact store');
		}

		let {following} = this;

		let pending = contacts[(following ? 'remove' : 'add') + 'Contact'](this);

		pending.then(() => this.onChange('following'));

		return pending;
	}


	getID () {
		return this.Username;
	}


	getAchievements () {
		if (!this.hasLink('Badges')) {
			return Promise.reject('Badges not available');
		}

		return this.fetchLink('Badges')
			.then(workspace => new Achievements(this[Service], this, workspace));
	}


	getActivity () {
		let store = super.getActivity();
		let {Username} = this;
		let service = this[Service];

		if (this.isAppUser) {

			Object.assign(store, {

				postToActivity (body, title = '-') {
					let {href} = service.getCollection('Blog', Username) || {};

					if (!href) {
						return Promise.reject('No Collection to post to.');
					}

					return service.postParseResponse(href, {
						MimeType: 'application/vnd.nextthought.forums.personalblogentrypost',
						title,
						body
					})
					.then(blogEntry => blogEntry.postToLink('publish')
												.then(()=> blogEntry))
					.then(x => this.insert(x));
				}

			});
		}

		return store;
	}


	getMemberships () {
		if (!this.hasLink('memberships')) {
			return null;
		}

		return new Stream(
			this[Service],
			this,
			this.getLink('memberships')
		);
	}


	/**
	 * Get the communities this user is a member of.
	 *
	 * @param {boolean} excludeGroups Exclude DFL's from the result.
	 *
	 * @return {array} List of Communities
	 */
	getCommunities (excludeGroups) {
		let list = this.Communities;
		return excludeGroups ? list.filter(ONLY_COMMUNITIES) : list;
	}
}
