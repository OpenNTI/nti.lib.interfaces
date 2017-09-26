import {model, COMMON_PREFIX} from '../Registry';

import Post from './Post';

export default
@model
class Comment extends Post {
	static MimeType = [
		COMMON_PREFIX + 'forums.comment',
		COMMON_PREFIX + 'forums.generalforumcomment',
		COMMON_PREFIX + 'forums.contentforumcomment',
		COMMON_PREFIX + 'forums.personalblogcomment',
	]


	isTopLevel () {
		return false;
	}

	getReplies () {
		const link = this.getLink('replies');
		if (!link) {
			return Promise.resolve([]);
		}

		const params = {
			sortOn: 'CreatedTime',
			sortOrder: 'ascending'
		};

		return this.fetchLinkParsed('replies', params);
	}
}
