import {mixin} from '@nti/lib-decorators';

import {Service, Parser as parse} from '../../constants';
import GetContents from '../../mixins/GetContents';
import getLink from '../../utils/getlink';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';
import { encodeIdFrom } from '../../utils/href-ntiids';

import ForumContentsDataSource from './forum-contents-data-source';

const KnownSorts = [
	'createdTime',
	'NewestDescendantCreatedTime',
	'PostCount',
	'LikeCount'
];

export default
@model
@mixin(GetContents)
class Forum extends Base {
	static MimeType = [
		COMMON_PREFIX + 'forums.forum',
		COMMON_PREFIX + 'forums.communityforum',
		COMMON_PREFIX + 'forums.contentforum',
		COMMON_PREFIX + 'forums.dflforum',
	]

	static HIDE_PREFIXS = ['Open', 'In-Class']

	static Fields = {
		...Base.Fields,
		'ID':                          { type: 'string' }, // Local id (within the container)
		'NewestDescendant':            { type: 'model'  },
		'NewestDescendantCreatedTime': { type: 'date'   },
		'Reports':                     { type: 'model[]'},
		'TopicCount':                  { type: 'number' },
		'description':                 { type: 'string' },
		'title':                       { type: 'string' },
		'EmailNotifications':          { type: 'boolean'}
	}

	get displayTitle () {
		for (let x of Forum.HIDE_PREFIXS) {
			if (this.title.startsWith(x)) {
				return this.title.replace(x, '');
			}
		}

		return this.title;
	}

	getID () {
		if (this.creator !== 'system' || this.title !== 'Forum') {
			return super.getID();
		}

		return encodeIdFrom(this.href);
	}

	getBin () {
		const openBin = RegExp.prototype.test.bind(/open/i);
		const forCreditBin = RegExp.prototype.test.bind(/in-class/i);
		const title = this.title || '';

		return openBin(title)
			? 'Open'
			: forCreditBin(title)
				? 'ForCredit'
				: 'Other';
	}

	getRecentActivity (size) {

		const params = {
			batchStart: 0,
			batchSize: size || 5,
			sortOrder: 'descending',
			sortOn: 'NewestDescendantCreatedTime'
		};

		return this.getContents(params); //.then(function(result) { return result.Items; });
	}

	canCreateTopic () {
		return this.hasLink('add');
	}

	createTopic (data) {
		const service = this[Service];

		const link = this.getLink('add');
		if (!link) {
			return Promise.reject('Cannot post comment. Item has no \'add\' link.');
		}

		const {title, body} = data;

		const payload = {
			MimeType: 'application/vnd.nextthought.forums.post',
			tags: [],
			title: title,
			body: Array.isArray(body) ? body : [body]
		};

		return service.post(link, payload)
			.then(o => getLink(o, 'publish'))
			.then(uri => service.post(uri))
			.then(obj => this[parse](obj));

	}

	getContentsDataSource () {
		return new ForumContentsDataSource(this[Service], this, {
			sortOn: KnownSorts
		});
	}

	async edit (payload) {
		await this.putToLink('edit', payload);

		const parent = this.parent();
		parent.emit('change');
	}
}
