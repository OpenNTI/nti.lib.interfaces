import Entity from './Entity';

import Stream from '../stores/Stream';

import { Service } from '../CommonSymbols';

export default class Community extends Entity {
	constructor(service, data) {
		super(service, null, data);
		this.isCommunity = true;
	}


	getActivity (filterParams) {
		let {source} = filterParams || {};
		if (!source) {
			return super.getActivity(filterParams);
		}

		let linkPromise = this.getDiscussionBoardContents()
			.then(x => (x.Items || []).find(i=> i.ID === source) || Promise.reject('Source Not Found.'))
			.then(x => x.getLink('contents'));

		return new Stream(
			this[Service],
			this,
			linkPromise
		);
	}


	getDiscussionBoard () {
		return this.fetchLinkParsed('DiscussionBoard');
	}


	getDiscussionBoardContents () {
		return this.getDiscussionBoard().then(x => x.getContents());
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
