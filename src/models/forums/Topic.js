import {mixin} from '@nti/lib-decorators';

import GetContents from '../../mixins/GetContents';
import Likable from '../../mixins/Likable';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
@mixin(GetContents, Likable)
class Topic extends Base {
	static MimeType = [
		COMMON_PREFIX + 'forums.topic',
		COMMON_PREFIX + 'forums.communityheadlinetopic',
		COMMON_PREFIX + 'forums.communitytopic',
		COMMON_PREFIX + 'forums.contentheadlinetopic',
		COMMON_PREFIX + 'forums.dflheadlinetopic',
		COMMON_PREFIX + 'forums.dfltopic',
		COMMON_PREFIX + 'forums.headlinetopic',
	]

	static Fields = {
		...Base.Fields,
		'ContainerId':                 { type: 'string' },
		'ContainerTitle':              { type: 'string' },
		'NewestDescendant':            { type: 'model'  },
		'NewestDescendantCreatedTime': { type: 'date'   },
		'PostCount':                   { type: 'number' },
		'PublicationState':            { type: '*'      },
		'title':                       { type: 'string' },
		'headline':                    { type: 'model'  },
		'LikeCount':                   { type: 'number' },
		'Reports':                     { type: 'model[]'}
	}

	isTopic = true


	isTopLevel () {
		return true;
	}

	canAddComment () {
		return this.hasLink('add');
	}

	addComment (comment, inReplyTo) {
		const link = this.getLink('add');
		if (!link) {
			return Promise.reject('Cannot post comment. Item has no \'add\' link.');
		}

		const payload = {
			MimeType: 'application/vnd.nextthought.forums.post',
			tags: [],
			body: Array.isArray(comment) ? comment : [comment]
		};

		if (inReplyTo) {
			Object.assign(payload, {
				// inReplyTo: typeof inReplyTo === 'object' ? inReplyTo.NTIID : inReplyTo,
				inReplyTo: inReplyTo.NTIID,
				references: [...(inReplyTo.references || []), inReplyTo.NTIID]
			});
		}

		return this.postToLink('add', payload);// Parse response?
	}


	loadUserSummary (user) {
		const params = user ? {user} : {};

		return this.fetchLinkParsed('UserTopicParticipationSummary', params);
	}
}
