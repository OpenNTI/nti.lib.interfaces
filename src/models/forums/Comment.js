import {mixin} from '@nti/lib-decorators';

import Threadable from '../../mixins/Threadable';
import PostInterface from '../../mixins/PostInterface';
import {model, COMMON_PREFIX} from '../Registry';

import Post from './Post';

export default
@model
@mixin(Threadable, PostInterface)
class Comment extends Post {
	static MimeType = [
		COMMON_PREFIX + 'forums.comment',
		COMMON_PREFIX + 'forums.generalforumcomment',
		COMMON_PREFIX + 'forums.contentforumcomment',
		COMMON_PREFIX + 'forums.personalblogcomment',
	]

	static Fields = {
		...Post.Fields,
		'ContainerId':       { type: 'string'   },
		'ContainerTitle':    { type: 'string'   },
		'ContainerMimeType': { type: 'string'   },
		'ReferencedByCount': { type: 'number'   },
		'inReplyTo':         { type: 'string'   },
		'references':        { type: 'string[]' }
	}

	isComment = true;

	get isBlogComment () {
		return this.MimeType === COMMON_PREFIX + 'forums.personalblogcomment';
	}

	get isTopicComment () {
		return !this.isBlogComment;
	}


	isTopLevel () {
		return false;
	}

	getFlatReplies () {
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

	#getParentTopic = () => {
		return this.parent(p => p.isTopic);
	}

	canAddDiscussion () {
		const topic = this.#getParentTopic();

		return topic.canAddDiscussion();
	}

	getDiscussionCount () { return this.ReferencedByCount; }
	updateDiscussionCount (updated) {
		this.ReferencedByCount = updated;
		this.onChange();
	}

	getDiscussions () { return this.getReplies(); }

	async addDiscussion (data) {
		const topic = this.#getParentTopic();
		const discussion = await topic.addDiscussion({...data, inReplyTo: this});

		discussion.reparent(this);

		this.onDiscussionAdded(discussion);

		return discussion;
	}
}
