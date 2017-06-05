import {mixin} from 'nti-lib-decorators';

import {Service, Parser as parse} from '../../constants';
import GetContents from '../../mixins/GetContents';
import getLink from '../../utils/getlink';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

@model
@mixin(GetContents)
export default class Forum extends Base {
	static MimeType = [
		COMMON_PREFIX + 'forums.forum',
		COMMON_PREFIX + 'forums.communityforum',
		COMMON_PREFIX + 'forums.contentforum',
		COMMON_PREFIX + 'forums.dflforum',
	]

	constructor (service, parent, data) {
		super(service, parent, data);

		// Creator: "username"
		// ID: "Forum" -- Local id (within the container)
		// NewestDescendant
		// NewestDescendantCreatedTime
		// TopicCount: 2
		// description: ""
		// title: "Forum"

		this[parse]('NewestDescendant');
	}

	getBin () {
		const openBin = RegExp.prototype.test.bind(/open/i);
		const forCreditBin = RegExp.prototype.test.bind(/in\-class/i);
		const title = this.title || '';

		return	openBin(title) ?		'Open' :
				forCreditBin(title) ?	'ForCredit' :
										'Other';
	}

	getRecentActivity (size) {

		let params = {
			batchStart: 0,
			batchSize: size || 5,
			sortOrder: 'descending',
			sortOn: 'NewestDescendantCreatedTime'
		};

		return this.getContents(params); //.then(function(result) { return result.Items; });
	}

	createTopic (data) {
		const service = this[Service];

		let link = this.getLink('add');
		if (!link) {
			return Promise.reject('Cannot post comment. Item has no \'add\' link.');
		}

		let {title, body} = data;

		let payload = {
			MimeType: 'application/vnd.nextthought.forums.post',
			tags: [],
			title: title,
			body: Array.isArray(body) ? body : [body]
		};

		return service.post(link, payload)
			.then(result =>
				service.post(getLink(result, 'publish'))
					.then(obj => this[parse](obj)));

	}

}
