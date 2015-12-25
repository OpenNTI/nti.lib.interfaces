import Base from '../Base';
import {
	Service,
	Parser as parse
} from '../../constants';

import GetContents from '../mixins/GetContents';
//import SharedWithList from '../mixins/SharedWithList';

import getLink from '../../utils/getlink';

export default class Forum extends Base {
	constructor (service, parent, data) {
		super(service, parent, data, GetContents/*, SharedWithList*/);

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
