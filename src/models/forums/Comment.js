import QueryString from 'query-string';

import {Service, Parser as parse} from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';

import Post from './Post';

@model
export default class Comment extends Post {
	static MimeType = [
		COMMON_PREFIX + 'forums.comment',
		COMMON_PREFIX + 'forums.generalforumcomment',
		COMMON_PREFIX + 'forums.contentforumcomment',
		COMMON_PREFIX + 'forums.personalblogcomment',
	]

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
