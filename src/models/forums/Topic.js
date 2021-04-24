import { Service } from '../../constants.js';
import Page from '../../data-sources/data-types/Page.js';
import GetContents from '../../mixins/GetContents.js';
import Likable from '../../mixins/Likable.js';
import Pinnable from '../../mixins/Pinnable.js';
import Flaggable from '../../mixins/Flaggable.js';
import DiscussionInterface from '../../mixins/DiscussionInterface.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class Topic extends DiscussionInterface(
	GetContents(Pinnable(Likable(Flaggable(Base))))
) {
	static MimeType = [
		COMMON_PREFIX + 'forums.topic',
		COMMON_PREFIX + 'forums.communityheadlinetopic',
		COMMON_PREFIX + 'forums.communitytopic',
		COMMON_PREFIX + 'forums.contentheadlinetopic',
		COMMON_PREFIX + 'forums.dflheadlinetopic',
		COMMON_PREFIX + 'forums.dfltopic',
		COMMON_PREFIX + 'forums.headlinetopic',
	];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'ContainerId':                    { type: 'string' },
		'ContainerTitle':                 { type: 'string' },
		'ContainerDefaultSharedToNTIIDs': {type: 'string[]'},
		'NewestDescendant':               { type: 'model'  },
		'NewestDescendantCreatedTime':    { type: 'date'   },
		'PostCount':                      { type: 'number' },
		'PublicationState':               { type: '*'      },
		'title':                          { type: 'string' },
		'headline':                       { type: 'model'  },
		'LikeCount':                      { type: 'number' },
		'Reports':                        { type: 'model[]'}
	}

	isTopic = true;

	canEditSharing() {
		return false;
	}
	getSharedWith() {
		return this.ContainerDefaultSharedToNTIIDs;
	}

	isTopLevel() {
		return true;
	}

	getPost() {
		return this.headline;
	}

	canAddComment() {
		return this.hasLink('add');
	}

	addComment(comment, inReplyTo) {
		const link = this.getLink('add');
		if (!link) {
			return Promise.reject(
				"Cannot post comment. Item has no 'add' link."
			);
		}

		const payload = {
			MimeType: 'application/vnd.nextthought.forums.post',
			tags: [],
			body: Array.isArray(comment) ? comment : [comment],
		};

		if (inReplyTo) {
			Object.assign(payload, {
				// inReplyTo: typeof inReplyTo === 'object' ? inReplyTo.NTIID : inReplyTo,
				inReplyTo: inReplyTo.NTIID,
				references: [...(inReplyTo.references || []), inReplyTo.NTIID],
			});
		}

		return this.postToLink('add', payload); // Parse response?
	}

	loadUserSummary(user) {
		const params = user ? { user } : {};

		return this.fetchLinkParsed('UserTopicParticipationSummary', params);
	}

	canAddDiscussion() {
		return this.hasLink('add');
	}

	getDiscussionCount() {
		return this.PostCount;
	}
	updateDiscussionCount(updated) {
		this.PostCount = updated;
		this.onChange();
	}

	async getDiscussions(params) {
		const raw = await this.fetchLink('contents', {
			...params,
			filter: 'TopLevel',
		});

		if (params.batchSize) {
			raw.PageSize = params.batchSize;
		}

		const page = new Page(this[Service], this, raw);

		for (let item of page.Items) {
			item.overrideParentDiscussion?.(this);
		}

		return page.waitForPending();
	}

	async addDiscussion(data, forComment) {
		if (!this.hasLink('add')) {
			throw new Error('Cannot add discussion');
		}

		const { inReplyTo, ...otherData } = data;
		const payload = {
			MimeType: 'application/vnd.nextthought.forums.post',
			...otherData,
		};

		if (inReplyTo) {
			Object.assign(payload, {
				inReplyTo: inReplyTo.NTIID,
				references: [...(inReplyTo.references || []), inReplyTo.NTIID],
			});
		}

		const discussion = await this.postToLink(
			'add',
			DiscussionInterface.getPayload(payload),
			true
		);

		if (!forComment) {
			discussion.overrideParentDiscussion(this);
			this.onDiscussionAdded(discussion);
		}

		return discussion;
	}
}

Registry.register(Topic);
