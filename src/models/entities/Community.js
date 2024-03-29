import Stream from '../../stores/Stream.js';
import { Service } from '../../constants.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';
import { Channels } from '../community/index.js';
import PagedLinkDataSource from '../../data-sources/common/PagedLinkDataSource.js';

import Entity from './Entity.js';

const ResolveChannelList = Symbol('Resolve Channel List');

const KnownActivitySorts = [
	'createdTime',
	'Last Modified',
	'ReferencedByCount',
	'LikeCount',
];

export default class Community extends Entity {
	static MimeType = COMMON_PREFIX + 'community';

	static SiteAutoSubscribe = {
		MimeType: 'application/vnd.nextthought.autosubscribe.siteautosubscribe',
	};

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'RemoteIsMember': {type: 'boolean'},
		'NumberOfMembers': {type: 'number'},
		'auto_subscribe': {type: 'object'}
	};

	get isCommunity() {
		return true;
	}

	#channelListPromise = null;

	constructor(service, data) {
		super(service, null, data);
	}

	get displayType() {
		return 'Community';
	}

	get isJoined() {
		return this.RemoteIsMember;
	}

	get autoSubscribeRule() {
		return this['auto_subscribe'];
	}

	get canDelete() {
		return this.hasLink('delete');
	}

	get isCourseCommunity() {
		return this.hasLink('CourseInstance');
	}

	get courseId() {
		return this.getLinkProperty('CourseInstance', 'ntiid');
	}

	getActivity(filterParams) {
		let { source } = filterParams || {};
		let service = this[Service],
			store,
			href,
			forum;

		let linkPromise = this.getDiscussionBoardContents()
			.then(x => {
				//What is the default forum?? Should there be a flag/id somewhere?
				let f =
					x.Items.find(item => item.title === 'Forum') || x.Items[0];

				if (source) {
					f = (x.Items || []).find(i => i.ID === source);
				}

				return f || Promise.reject('Source Not Found.');
			})

			//Once a forum is picked, assign the href...
			.then(x => {
				href = x.getLink('add'); //this sets the href for our "postToActivity" augmented method.
				forum = x;

				//return the value to be the Stream Store's data source.
				return source //if there is a source set,
					? x.getLink('contents') // use its contents link,
					: this.getLink('Activity'); // otherwise, use the Community's Activity link.
			});

		store = new Stream(service, this, linkPromise, {
			sortOn: 'createdTime',
			sortOrder: 'descending',
			batchStart: 0,
			batchSize: 10,
		});

		linkPromise.then(() => {
			if (!href) {
				store.postToActivity = void 0;
				return;
			}

			Object.assign(store, {
				emailNoticiation: forum && forum.EmailNotifications,
				postToActivity(body, title = '-') {
					if (!href) {
						return Promise.reject('No forum to post to.');
					}

					return service
						.postParseResponse(href, {
							MimeType:
								'application/vnd.nextthought.forums.headlinepost',
							title,
							body,
						})
						.then(topic =>
							topic
								.fetchLink({
									method: 'post',
									mode: 'raw',
									rel: 'publish',
								})
								.then(() => topic)
						)
						.then(x => this.insert(x));
				},
			});

			store.emit('change');
		});

		return store;
	}

	getDiscussionBoard() {
		return this.fetchLink('DiscussionBoard');
	}

	getDiscussionBoardContents() {
		return this.getDiscussionBoard().then(x => x.getContents());
	}

	get hasMembers() {
		return this.hasLink('members');
	}
	get canAddMembers() {
		return this.hasLink('AddMembers');
	}
	get canRemoveMembers() {
		return this.hasLink('RemoveMembers');
	}
	get canManageMembers() {
		return this.canAddMembers || this.canRemoveMembers;
	}

	get memberCount() {
		return this.NumberOfMembers;
	}

	getMembersDataSource() {
		return PagedLinkDataSource.forLink(
			this[Service],
			this,
			this.getLink('members')
		);
	}

	async addMembers(users) {
		const resp = await this.fetchLink({
			method: 'post',
			mode: 'raw',
			rel: 'AddMembers',
			data: { users },
		});
		const { Added, NumberOfMembers } = resp;

		await this.refresh({ NumberOfMembers, NTIID: this.NTIID });

		this.emit('members-added', Added);
		this.emit('members-changed', resp);

		return resp;
	}

	async removeMembers(users) {
		const resp = await this.fetchLink({
			method: 'post',
			mode: 'raw',
			rel: 'RemoveMembers',
			data: { users },
		});
		const { Removed, NumberOfMembers } = resp;

		await this.refresh({ NumberOfMembers, NTIID: this.NTIID });

		this.emit('members-removed', Removed);
		this.emit('members-changed', resp);

		return resp;
	}

	getMembers() {
		if (!this.hasLink('members')) {
			return null;
		}

		return new Stream(this[Service], this, this.getLink('members'));
	}

	get canJoin() {
		return this.hasLink('join');
	}

	async join() {
		const resp = await this.fetchLink({
			method: 'post',
			mode: 'raw',
			rel: 'join',
			data: {},
		});

		await this.refresh(resp);

		return resp;
	}

	get canLeave() {
		return this.hasLink('leave');
	}

	async leave() {
		const resp = await this.fetchLink({
			method: 'post',
			mode: 'raw',
			rel: 'leave',
			data: {},
		});

		await this.refresh(resp);

		return resp;
	}

	getAllActivityDataSource() {
		return PagedLinkDataSource.forLink(
			this[Service],
			this,
			this.getLink('Activity'),
			{ sortOn: KnownActivitySorts }
		);
	}

	getChannelList() {
		if (!this.#channelListPromise) {
			this.#channelListPromise = this[ResolveChannelList]();
		}

		return this.#channelListPromise;
	}

	getDefaultSharing() {
		return {
			scopes: [this],
			locked: true,
		};
	}

	[ResolveChannelList] = async () => {
		const board = await this.getDiscussionBoard();
		const channelList = await Channels.List.fromBoard(board, '', forum => {
			const addDiscussion = forum.canCreateTopic()
				? topic => forum.createTopic(topic)
				: null;

			return new Channels.Channel({
				backer: forum,
				id: forum.getID(),
				title: this.getLinkProperty('Activity', 'title') || 'Activity',
				contentsDataSource: this.getAllActivityDataSource(),
				setTitle: null,
				pinned: true,
				addDiscussion,
				DefaultSharedToNTIIDs: forum.DefaultSharedToNTIIDs,
			});
		});

		return channelList;
	};

	async save(data) {
		const payload = { ...data };

		if (data.displayName != null) {
			payload.alias = data.displayName;
			delete payload.displayName;
		}

		if ('autoSubscribeRule' in data) {
			payload['auto_subscribe'] = data.autoSubscribeRule;
			delete payload.autoSubscribeRule;
		}

		try {
			await super.save(payload);
		} catch (e) {
			if (e.field === 'alias') {
				e.field === 'displayName';
			}
			if (e.field === 'auto_subscribe') {
				e.field === 'autoSubscribeRule';
			}

			throw e;
		}
	}

	async delete() {
		this.emit('deleting');
		const resp = await super.delete('delete');

		this.emit('deleted');

		return resp;
	}
}

Registry.register(Community);
