import Base from '../Base';
import {
	Service,
	Parser as parse,
} from '../../CommonSymbols';

import GetContents from '../mixins/GetContents';
//import SharedWithList from '../mixins/SharedWithList';

export default class Topic extends Base {
	constructor(service, parent, data) {
		super(service, parent, data, GetContents/*, SharedWithList*/);

		// PostCount
		// title
		// PublicationState
		// NewestDescendant
		// NewestDescendantCreatedTime

		this[parse]('NewestDescendant');
		this[parse]('headline');
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
}
