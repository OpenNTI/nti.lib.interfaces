import Base from './Base';

import Stream from '../stores/Stream';

import ActivityCollator from '../utils/activity-collator';

import { Service } from '../CommonSymbols';


export default class Entity extends Base {

	constructor (service, parent, data) {
		super(service, parent, data);
	}


	//Determins if the logged in user is a member of this Entity. (default implementation)
	// This cannot be called/read during the app's initialization...
	get isAppUserAMember () {
		let me = this[Service].getAppUserSync();
		let entityID = this.getID();

		return me.getID() === entityID //if the Entity represents the App User (users are entities)
			|| me.Communities.some(x=> x.getID() === entityID); // Or if the Entity's ID is in the set of Communities
	}


	get avatar () {
		return this.avatarURL;
	}


	get displayName () {
		return this.alias || this.realname || this.Username;
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
}
