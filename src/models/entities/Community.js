import Stream from '../../stores/Stream';
import { Service } from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';

import Entity from './Entity';

export default
@model
class Community extends Entity {
	static MimeType = COMMON_PREFIX + 'community'

	isCommunity = true


	constructor (service, data) {
		super(service, null, data);
	}


	get displayType () {
		return 'Community';
	}


	getActivity (filterParams) {
		let {source} = filterParams || {};
		let service = this[Service], store, href, forum;

		let linkPromise = this.getDiscussionBoardContents().then(x => {

			//What is the default forum?? Should there be a flag/id somewhere?
			let f = x.Items.find(item => (item.title === 'Forum')) || x.Items[0];

			if (source) {
				f = (x.Items || []).find(i=> i.ID === source);
			}

			return f || Promise.reject('Source Not Found.');
		})

		//Once a forum is picked, assign the href...
			.then(x => {
				href = x.getLink('add');//this sets the href for our "postToActivity" augmented method.
				forum = x;

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

		linkPromise.then(()=> {
			if (!href) {
				store.postToActivity = void 0;
				return;
			}

			Object.assign(store, {
				emailNoticiation: forum && forum.EmailNotifications,
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

			store.emit('change');
		});

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
