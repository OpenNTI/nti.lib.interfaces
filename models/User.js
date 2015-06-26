import Base from './Base';

import Achievements from '../stores/Achievements';

import { Service, Parser as parse } from '../CommonSymbols';

const ONLY_COMMUNITIES = x => x.isCommunity;

export default class User extends Base {

	constructor (service, data) {
		super(service, null, data);

		this[parse]('Communities');
		this[parse]('positions');
		this[parse]('education');
	}

	get avatar () {
		return this.avatarURL;
	}


	get displayName () {
		return this.alias || this.realname || this.Username;
	}


	get firstName () { return this.NonI18NFirstName; }
	get lastName () { return this.NonI18NLastName; }


	get initials () {
		let {displayName, firstName, lastName} = this;
		return (firstName && lastName) ? `${firstName[0]}${lastName[0]}` : displayName[0];
	}


	getAchievements () {
		if (!this.hasLink('Badges')) {
			return Promise.reject('Badges not available');
		}

		return this.fetchLink('Badges')
			.then(workspace => new Achievements(this[Service], this, workspace));
	}


	getActivity () {
		if (!this.hasLink('Activity')) {
			return Promise.reject('No Activity link.');
		}
		return this.fetchLinkParsed('Activity');
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
