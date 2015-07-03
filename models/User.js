import Base from './Base';

import Achievements from '../stores/Achievements';
import Stream from '../stores/Stream';

import ActivityCollator from '../utils/activity-collator';

import { Service, Parser as parse } from '../CommonSymbols';

const ONLY_COMMUNITIES = x => x.isCommunity;

export default class User extends Base {

	constructor (service, data) {
		super(service, null, data);

		this[parse]('Communities');
		this[parse]('positions');
		this[parse]('education');
	}

	getID () {
		return this.Username;
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
			return null;
		}

		let exclude = [
			'assessment.assessedquestion',
			'bookmark',
			'redaction'
		];

		return new Stream(
			this[Service],
			this,
			this.getLink('Activity'),
			{
				exclude: exclude.map(x=> 'application/vnd.nextthought.' + x).join(','),
				sortOn: 'createdTime',
				sortOrder: 'descending',
				batchStart: 0,
				batchSize: 10
			},
			ActivityCollator
		);
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
