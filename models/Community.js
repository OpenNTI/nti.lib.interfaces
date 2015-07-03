import Entity from './Entity';

import Stream from '../stores/Stream';

import { Service } from '../CommonSymbols';

export default class Community extends Entity {
	constructor(service, data) {
		super(service, null, data);
		this.isCommunity = true;
	}


	getMembers () {
		if (!this.hasLink('members')) {
			return null;
		}

		return new Stream(
			this[Service],
			this,
			this.getLink('members')
		);
	}

}
