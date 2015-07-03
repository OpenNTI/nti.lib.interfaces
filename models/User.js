import Entity from './Entity';

import Achievements from '../stores/Achievements';
import Stream from '../stores/Stream';

import { Service, Parser as parse } from '../CommonSymbols';

const ONLY_COMMUNITIES = x => x.isCommunity;

export default class User extends Entity {

	constructor (service, data) {
		super(service, null, data);

		this[parse]('Communities');
		this[parse]('positions');
		this[parse]('education');
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
