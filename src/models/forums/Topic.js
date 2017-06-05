import {mixin} from 'nti-lib-decorators';

import {Service, Parser as parse} from '../../constants';
import GetContents from '../../mixins/GetContents';
import Likable from '../../mixins/Likable';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

@model
@mixin(GetContents, Likable)
export default class Topic extends Base {
	static MimeType = [
		COMMON_PREFIX + 'forums.topic',
		COMMON_PREFIX + 'forums.communityheadlinetopic',
		COMMON_PREFIX + 'forums.communitytopic',
		COMMON_PREFIX + 'forums.contentheadlinetopic',
		COMMON_PREFIX + 'forums.dflheadlinetopic',
		COMMON_PREFIX + 'forums.dfltopic',
		COMMON_PREFIX + 'forums.headlinetopic',
	]

	constructor (service, parent, data) {
		super(service, parent, data);

		// PostCount
		// title
		// PublicationState
		// NewestDescendant
		// NewestDescendantCreatedTime

		this[parse]('NewestDescendant');
		this[parse]('headline');
	}

	isTopLevel () {
		return true;
	}

	addComment (comment, inReplyTo) {
		const service = this[Service];
		let link = this.getLink('add');
		if (!link) {
			return Promise.reject('Cannot post comment. Item has no \'add\' link.');
		}

		let payload = {
			MimeType: 'application/vnd.nextthought.forums.post',
			tags: [],
			body: Array.isArray(comment) ? comment : [comment]
		};

		if (inReplyTo) {
			// inReplyTo = typeof inReplyTo === 'object' ? inReplyTo.NTIID : inReplyTo;
			payload.inReplyTo = inReplyTo.NTIID;
			payload.references = (inReplyTo.references || []).slice(0);
			payload.references.push(inReplyTo.NTIID);
		}

		return service.post(link, payload);
	}


	loadUserSummary (user) {
		const params = user ? {user} : {};

		return this.fetchLinkParsed('UserTopicParticipationSummary', params);
	}
}
