import Logger from '@nti/util-logger';
import { isNTIID } from '@nti/lib-ntiids';

import { Service, Parser as parse } from '../../constants.js';
import Page from '../../data-sources/data-types/Page.js';
import Flaggable from '../../mixins/Flaggable.js';
import Threadable from '../../mixins/Threadable.js';
import DiscussionInterface from '../../mixins/DiscussionInterface.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';

import Highlight from './Highlight.js';

const logger = Logger.get('models:annotations:Note');
const UpdatedDiscussionCount = Symbol('Discussion Count');

export default class Note extends DiscussionInterface(
	Threadable(Flaggable(Highlight))
) {
	static MimeType = COMMON_PREFIX + 'note';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'body':                   { type: '*[]'      },
		'inReplyTo':              { type: 'string'   },
		'references':             { type: 'string[]' },
		'ReferencedByCount':      { type: 'number'   },
		'LikeCount':              { type: 'number'   },
		'title':                  { type: 'string'   },
		'presentationProperties': { type: 'object'   },
		'style':                  { type: 'string'   },
		'Class':                  { type: 'string'   }
	};

	get isNote() {
		return true;
	}

	get replyCount() {
		// Rely on this value, placeholders will have a getter for the ReferencedByCount property.
		return this.ReferencedByCount || 0;
	}

	canReply(tryScopes = []) {
		return !!(this[Service].getCollectionFor(this, null, tryScopes) || {})
			.href;
	}

	postReply(body, tryScopes = []) {
		let service = this[Service];
		let target = (service.getCollectionFor(this, null, tryScopes) || {})
			.href;
		if (!target) {
			logger.error('Nowhere to save object: %o', this);
		}

		if (!Array.isArray(body)) {
			body = [body];
		}

		return new Promise(save => {
			let reply = new Note(service, this, {
				Class: 'Note',
				MimeType: Note.MimeType,
				body,
				ContainerId: this.ContainerId,
				applicableRange:
					this.applicableRange && this.applicableRange.getData(),
				inReplyTo: this.getID(),
				references: (this.references || [])
					.slice()
					.concat(this.getID()),
			});

			save(reply);
		})
			.then(reply => service.post(target, reply.getData()))
			.then(data => this[parse](data))
			.then(reply => {
				this.appendChild(reply);
				this.emit('change');
			});
	}

	isDeleted() {
		return this.placeholder;
	}

	getExtraMentions() {
		return (this.sharedWith ?? [])
			.filter(x => isNTIID(x))
			.map(x => ({ CanAccessContent: true, User: x }));
	}

	canEditSharing() {
		return this.replyCount <= 0;
	}

	canAddDiscussion() {
		return this.canReply() && !this.isDeleted();
	}
	getDiscussionCount() {
		return this.replyCount;
	}
	updateDiscussionCount(discussionCount) {
		this.ReferencedByCount = discussionCount;
		this.onChange();
	}

	async getDiscussions(params) {
		const replies = await this.getReplies();

		return Page.fromList(replies, this);
	}

	async addDiscussion(data) {
		let service = this[Service];
		let href = service.getCollectionFor(this, null, [])?.href;

		if (!href) {
			throw new Error('No link');
		}

		const discussion = await service.postParseResponse(
			href,
			DiscussionInterface.getPayload({
				Class: 'Note',
				MimeType: Note.MimeType,
				ContainerId: this.ContainerId,
				applicableRange: this.applicableRange?.getData() ?? null,
				inReplyTo: this.getID(),
				references: [...(this.references || []), this.getID()],
				...data,
			}),
			this
		);

		this[UpdatedDiscussionCount] = this.getDiscussionCount();

		this.prependChild(discussion, true);
		discussion.overrideParentDiscussion(this);
		this.onDiscussionAdded(discussion);

		return discussion;
	}
}

Registry.register(Note);
