import { Service, Parser as parse } from '../../constants.js';
import GetContents from '../../mixins/GetContents.js';
import DiscussionInterface from '../../mixins/DiscussionInterface.js';
import getLink from '../../utils/get-link.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';
import { encodeIdFrom } from '../../utils/href-ntiids.js';

import ForumContentsDataSource from './forum-contents-data-source/index.js';

const KnownSorts = ['createdTime', 'Last Modified', 'PostCount', 'LikeCount'];

export default class Forum extends GetContents(Base) {
	static MimeType = [
		COMMON_PREFIX + 'forums.forum',
		COMMON_PREFIX + 'forums.communityforum',
		COMMON_PREFIX + 'forums.contentforum',
		COMMON_PREFIX + 'forums.dflforum',
	];

	static HIDE_PREFIXS = ['Open', 'In-Class'];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'ID':                          { type: 'string' }, // Local id (within the container)
		'NewestDescendant':            { type: 'model'  },
		'NewestDescendantCreatedTime': { type: 'date'   },
		'Reports':                     { type: 'model[]'},
		'TopicCount':                  { type: 'number' },
		'description':                 { type: 'string' },
		'title':                       { type: 'string' },
		'EmailNotifications':          { type: 'boolean'},
		'IsDefaultForum':              { type: 'boolean'},
		'DefaultSharedToNTIIDs':       { type: 'string[]'},
		'DefaultSharedToDisplayNames': { type: 'string[]'}
	};

	isForum = true;

	get displayTitle() {
		for (let x of Forum.HIDE_PREFIXS) {
			if (this.title.startsWith(x)) {
				return this.title.replace(x, '');
			}
		}

		return this.title;
	}

	getID() {
		if (!this.IsDefaultForum) {
			return super.getID();
		}

		return encodeIdFrom(this.href);
	}

	getBin() {
		const openBin = RegExp.prototype.test.bind(/open/i);
		const forCreditBin = RegExp.prototype.test.bind(/in-class/i);
		const title = this.title || '';

		return openBin(title)
			? 'Open'
			: forCreditBin(title)
			? 'ForCredit'
			: 'Other';
	}

	getRecentActivity(size) {
		const params = {
			batchStart: 0,
			batchSize: size || 5,
			sortOrder: 'descending',
			sortOn: 'NewestDescendantCreatedTime',
		};

		return this.getContents(params); //.then(function(result) { return result.Items; });
	}

	canCreateTopic() {
		return this.hasLink('add');
	}

	createTopic(data) {
		const service = this[Service];

		const link = this.getLink('add');
		if (!link) {
			return Promise.reject(
				"Cannot post comment. Item has no 'add' link."
			);
		}

		const { title, body, mentions, tags } = data;

		const payload = DiscussionInterface.getPayload({
			MimeType: 'application/vnd.nextthought.forums.post',
			title: title,
			body: Array.isArray(body) ? body : [body],
			mentions,
			tags: tags ?? [],
		});

		return service
			.post(link, payload)
			.then(o => getLink(o, 'publish'))
			.then(uri => service.post(uri))
			.then(obj => this[parse](obj));
	}

	getContentsDataSource() {
		return new ForumContentsDataSource(this[Service], this, {
			sortOn: KnownSorts,
		});
	}

	async edit(payload) {
		await this.fetchLink({
			method: 'put',
			mode: 'raw',
			rel: 'edit',
			data: payload,
		});

		const parent = this.parent();
		parent.emit('change');
	}
}

Registry.register(Forum);
