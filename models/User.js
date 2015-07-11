import Entity from './Entity';

import Achievements from '../stores/Achievements';
import Stream from '../stores/Stream';

import { Service, Parser as parse } from '../CommonSymbols';

const ONLY_COMMUNITIES = x => x.isCommunity;

export default class User extends Entity {

	constructor (service, data) {
		super(service, null, data);
		this.isUser = true;

		this[parse]('Communities');
		this[parse]('positions');
		this[parse]('education');
	}


	get firstName () { return this.NonI18NFirstName; }
	get lastName () { return this.NonI18NLastName; }


	get initials () {
		let {displayName, firstName, lastName} = this;
		return (firstName && lastName) ? `${firstName[0]}${lastName[0]}` : displayName[0];
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

		if (this.isAppUserAMember) {

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
					.then(response => {
						let publish = (response || {}).getLink && (response || {}).getLink('publish');
						if (publish) {
							service.post(publish);
						}
						return response;
					})
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
