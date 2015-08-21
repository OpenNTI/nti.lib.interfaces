import Base from './Base';

import Stream from '../stores/Stream';

import ActivityCollator from '../utils/activity-collator';

import { Service } from '../CommonSymbols';


export default class Entity extends Base {

	constructor (service, parent, data) {
		super(service, parent, data);
	}


	get displayType () {
		return 'Unknown';
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
