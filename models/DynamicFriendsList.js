import FriendsList from './FriendsList';
import Stream from '../stores/Stream';
import {Service} from '../CommonSymbols';

export default class DynamicFriendsList extends FriendsList {
	constructor (service, parent, data) {
		super(service, parent, data);
		this.isGroup = true;

		this.ensureProperty('IsDynamicSharing', true, 'boolean', true);
	}


	get isMember () {
		return this.hasLink('my_membership');
	}


	leave () {
		return this[Service].delete(this.getLink('my_membership'))
			.then(() => this.refresh())
			.then(() =>	this.isMember = false)
			.then(() => this.onChange('membership'));
	}


	add () {
		return Promise.reject('Cannot add members to DFL');
	}


	remove () {
		return Promise.reject('Cannot remove members from DFL');
	}


	getActivity () {
		let service = this[Service], store, href;

		let linkPromise = this.getDiscussionBoardContents().then(x => {
			//the default forum:
			let forum = x.Items.find(item => (item.title === 'Forum')) || x.Items[0];

			return forum || Promise.reject('Source Not Found.');
		})

		//Once a forum is picked, assign the href...
		.then(x => {
			href = x.getLink('add');//this sets the href for our "postToActivity" augmented method.

			//return the value to be the Stream Store's data source.
			return this.getLink('Activity');
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
}
