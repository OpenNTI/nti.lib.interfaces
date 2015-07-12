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
		let service = this[Service], store, href;

		let linkPromise = this.getDiscussionBoardContents().then(x => {

			//What is the default forum?? Should there be a flag/id somewhere?
			let forum = x.Items.find(item => (item.title === 'Forum')) || x.Items[0];

			if (source) {
				forum = (x.Items || []).find(i=> i.ID === source);
			}

			return forum || Promise.reject('Source Not Found.');
		})

		//Once a forum is picked, assign the href...
		.then(x => {
			href = x.getLink('add');//this sets the href for our "postToActivity" augmented method.

			//return the value to be the Stream Store's data source.
			return source //if there is a source set,
				? x.getLink('contents') // use its contents link,
				: this.getLink('Activity'); // otherwise, use the Community's Activity link.
		});


		store = new Stream(
			service,
			this,
			linkPromise,
			{
				sortOn: 'createdTime',
				sortOrder: 'descending',
				batchStart: 0,
				batchSize: 10
			}
		);

		if (this.isAppUserAMember) {

			Object.assign(store, {

				postToActivity (body, title = '-') {
					if (!href) {
						return Promise.reject('No forum to post to.');
					}

					return service.postParseResponse(href, {
						MimeType: 'application/vnd.nextthought.forums.headlinepost',
						title,
						body
					})
					.then(topic => topic.postToLink('publish')
										.then(()=> topic))
					.then(x => this.insert(x));
				}

			});
		}

		return store;
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


	leave () {
		return this.postToLink('leave', {});
	}
}
