import Stream from '../../stores/Stream';
import { Service } from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';
import {Channels} from '../community';
import PagedLinkDataSource from '../../data-sources/common/PagedLinkDataSource';

import Entity from './Entity';

const ResolveChannelList = Symbol('Resolve Channel List');

const KnownActivitySorts = [
	'createdTime',
	'Last Modified',
	'ReferencedByCount',
	'LikeCount'
];

export default
@model
class Community extends Entity {
	static MimeType = COMMON_PREFIX + 'community'

	static Fields = {
		...Entity.Fields,
		'RemoteIsMember': {type: 'boolean'}
	}

	isCommunity = true

	#channelListPromise = null


	constructor (service, data) {
		super(service, null, data);
	}


	get displayType () {
		return 'Community';
	}

	get isJoined () {
		return this.RemoteIsMember;
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


	get hasMembers () { return this.hasLink('members'); }
	get canAddMembers () { return this.hasLink('AddMembers'); }
	get canRemoveMembers () { return this.hasLink('RemoveMembers'); }
	get canManageMembers () { return this.canAddMembers || this.canRemoveMembers; }


	getMembersDataSource () {
		return new PagedLinkDataSource.forLink(this[Service], this, this.getLink('members'));
	}


	addMembers (users) {
		if (!Array.isArray(users)) {
			users = [users];
		}

		return this.postToLink('AddMembers', {users: users});
	}


	removeMembers (users) {
		if (!Array.isArray(users)) {
			users = [users];
		}

		return this.postToLink('RemoveMembers', {users: users});
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

	get canJoin () {
		return this.hasLink('join');
	}

	async join () {
		const resp = await this.postToLink('join', {});

		await this.refresh(resp);

		return resp;
	}

	get canLeave () {
		return this.hasLink('leave');
	}

	async leave () {
		const resp = await this.postToLink('leave', {});

		await this.refresh(resp);

		return resp;
	}

	getAllActivityDataSource () {
		return new PagedLinkDataSource.forLink(this[Service], this, this.getLink('Activity'), {sortOn: KnownActivitySorts});
	}

	getChannelList () {
		if (!this.#channelListPromise) {
			this.#channelListPromise = this[ResolveChannelList]();
		}

		return this.#channelListPromise;
	}

	[ResolveChannelList] = async () => {
		const board = await this.getDiscussionBoard();
		const channelList = await Channels.List.fromBoard(
			board,
			'',
			(forum) => {
				const addTopic = forum.canCreateTopic() ?
					(topic) => forum.createTopic(topic) :
					null;

				return new Channels.Channel({
					backer: forum,
					id: forum.getID(),
					title: this.getLinkProperty('Activity', 'title') || 'Activity',
					contentsDataSource: this.getAllActivityDataSource(),
					setTitle: null,
					pinned: true,
					addTopic
				});
			}
		);

		return channelList;
	}

	async save (data) {
		const payload = {...data};

		if (data.displayName) {
			payload.alias = data.displayName;
			delete payload.displayName;
		}

		try {
			await super.save(payload);
		} catch (e) {
			if (e.field === 'alias') { e.field === 'displayName'; }
			throw e;
		}
	}
}
