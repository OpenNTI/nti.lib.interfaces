import Base from './Base';

import { Parser as parse } from '../CommonSymbols';

const ONLY_COMMUNITIES = x => x.isCommunity;

export default class User extends Base {

	constructor (service, data) {
		super(service, null, data);

		this[parse]('Communities');
	}


	get DisplayName () {
		return this.alias || this.realname || this.Username;
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
