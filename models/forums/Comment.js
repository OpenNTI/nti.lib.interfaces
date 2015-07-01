import {Service, Parser as parse} from '../../CommonSymbols';
import Post from './Post';

import QueryString from 'query-string';

export default class Comment extends Post {

	constructor (service, parent, data) {
		super(service, parent, data);
	}

	isTopLevel () {
		return false;
	}

	getReplies () {
		let link = this.getLink('replies');
		if (!link) {
			return Promise.resolve([]);
		}

		let params = {
			sortOn: 'CreatedTime',
			sortOrder: 'ascending'
		};

		link = link.concat('?', QueryString.stringify(params));

		return this[Service].get(link)
			.then(result => this[parse](result.Items));
	}
}
