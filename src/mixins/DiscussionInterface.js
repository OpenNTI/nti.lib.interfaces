import { v4 as uuid } from 'uuid';

import { isNTIID } from '@nti/lib-ntiids';

import { Service } from '../constants.js';

const DiscussionAdded = 'discussion-added';
const DiscussionDeleted = 'discussion-deleted';

const ResolvedMentions = Symbol('ResolvedMentions');

const ParentOverride = Symbol('Parent Override');

function getTitle(discussion) {
	const post = discussion.getPost();

	return post === discussion ? discussion.title : post.getTitle();
}

function getBody(discussion) {
	const post = discussion.getPost();

	return post === discussion ? discussion.body : post.getBody();
}

function getTags(discussion) {
	const post = discussion.getPost();

	return post === discussion ? discussion.tags : post.getTags();
}

function getMentions(discussion) {
	const post = discussion.getPost();

	if (post !== discussion) {
		return post.getMentions();
	}

	return post[ResolvedMentions];
}

async function resolveMentions(discussion) {
	const post = discussion.getPost();

	if (post !== discussion) {
		return;
	}

	const service = post[Service];
	const mentions = post.UserMentions ?? [];

	const resolved = await Promise.all(
		mentions.map(async mention => {
			const User = mention.User
				? await service.getObject(mention.User)
				: null;

			return {
				...mention,
				User,
			};
		})
	);

	post[ResolvedMentions] = resolved;
}

class DiscussionTree {
	static forDiscussion(discussion, sort, depth) {
		const tree = new DiscussionTree(discussion, sort, depth);

		return tree.load();
	}

	#node = null;
	#children = null;
	#depth = null;

	#sort = null;

	constructor(discussion, sort, depth = 0) {
		this.#node = discussion;
		this.#sort = sort;
		this.#depth = depth;
	}

	get node() {
		return this.#node;
	}
	get children() {
		return this.#children || [];
	}
	get depth() {
		return this.#depth;
	}

	async load() {
		let replies = await this.#node?.getDiscussions?.();

		replies = replies.Items ?? replies;

		if (!replies) {
			return;
		}

		if (this.#sort) {
			replies = replies.sort(this.#sort);
		}

		this.#children = await Promise.all(
			replies.map(reply =>
				DiscussionTree.forDiscussion(reply, this.#sort, this.depth + 1)
			)
		);

		return this;
	}

	subscribeToUpdates(fn) {
		const update = () => fn(this);

		const cleanUps = [
			...this.children.map(child => {
				return child.subscribeToUpdates(update);
			}),
			this.#node.subscribeToDiscussionAdded(async newDiscussion => {
				let newTree = new DiscussionTree(
					newDiscussion,
					this.#sort,
					this.depth + 1
				);

				cleanUps.push(newTree.subscribeToUpdates(update));

				let newReplies = [...this.children];

				newReplies.push(newTree);

				if (this.#sort) {
					newReplies = newReplies.sort((a, b) =>
						this.#sort(a.node, b.node)
					);
				}

				this.#children = newReplies;

				update();
			}),
		];

		return () => {
			for (let cleanup of cleanUps) {
				cleanup();
			}
		};
	}
}

export const getPayload = payload => {
	const json = { ...payload, mentions: [], body: [] };

	//For now strip out any ntiid like mentions
	//since only users can be mentions and usernames
	//won't be NTIID like :fingers-crossed:
	for (let mention of payload.mentions || []) {
		if (!isNTIID(mention) && json.mentions.indexOf(mention) === -1) {
			json.mentions.push(mention);
		}
	}

	//If we have non-string body parts we most likely need to do form data...
	if (!payload?.body?.some?.(part => typeof part !== 'string' && part.file)) {
		json.body = payload.body;

		return json;
	}

	const formData = new FormData();

	for (let part of payload.body || []) {
		if (typeof part === 'string') {
			json.body.push(part);
			continue;
		}

		const clone = { ...part };

		if (clone && clone.file) {
			const name = uuid();

			formData.append(name, clone.file, (clone.file || {}).name);
			clone.name = name;
			delete clone.file;
		}

		json.body.push(clone);
	}

	formData.append('__json__', JSON.stringify(json));
	return formData;
};

/**
 * @template {import('../types').Constructor} T
 * @param {T} Base
 * @mixin
 */
export const mixin = Base =>
	class DiscussionInterface extends Base {
		static Fields = {
			...super.Fields,
			title: super.Fields.title ?? { type: 'string' },
			body: super.Fields.body ?? { type: '*[]' },
			tags: super.Fields.tags ?? { type: 'string[]' },
			mentions: super.Fields.mentions ?? { type: 'string[]' },
			UserMentions: super.Fields.UserMentions ?? {
				type: 'object[]',
			},
			sharedWith: super.Fields.sharedWith ?? { type: 'string[]' },
		};

		constructor(...args) {
			super(...args);
			// TODO: Should resolveMentions occur even if addToPending is not available?
			this.addToPending?.(resolveMentions(this));
		}

		// make non-enumerable
		get isDiscussion() {
			return true;
		}

		getPost() {
			return this;
		}

		getPostHash() {
			const post = this.getPost();
			const parts = [
				post.getID(),
				post.getLastModified(),
				(this.getMentions() ?? []).map(x => x.User?.getID()).join(','),
				(this.getSharedWith() ?? []).map(x => x.getID?.()).join(','),
			];

			return parts.join('-');
		}

		async refresh(item) {
			await super.refresh(item);
			await resolveMentions(this);
			return this;
		}

		getTitle() {
			return getTitle(this);
		}

		getBody() {
			return getBody(this);
		}

		getTags() {
			return getTags(this);
		}

		getMentions() {
			return getMentions(this);
		}

		getMentionFor(username) {
			if (!username) {
				return null;
			}
			if (username.getID) {
				username = username.getID();
			}

			const mentions = this.getMentions();

			return (mentions || []).find(
				mention => mention?.User?.getID?.() === username
			);
		}

		canEditSharing() {
			return null;
		}

		getSharedWith() {
			return this.sharedWith;
		}

		isSharedWith(entity) {
			const sharedWith = this.getSharedWith();

			if (typeof entity === 'string') {
				return sharedWith.indexOf(entity) !== -1;
			}

			return sharedWith.some(s => {
				if (s === entity.getID()) {
					return true;
				}
				if (s === entity.NTIID) {
					return true;
				}
				if (s === entity.Username) {
					return true;
				}

				return false;
			});
		}

		isDeleted() {
			return false;
		}

		async updatePost(data, ...args) {
			const post = this.getPost();

			if (post !== this) {
				return post.updatePost(data, ...args);
			}

			const payload = getPayload(data);

			const result = await this.save(payload, ...args);
			await resolveMentions(this);

			this.onChange();

			return result;
		}

		getParentDiscussion() {
			if (this[ParentOverride]) {
				return this[ParentOverride];
			}

			const parent = this.parent(p => p.isDiscussion);

			return parent?.isDiscussion ? parent : null;
		}

		overrideParentDiscussion(parent) {
			this[ParentOverride] = parent;
		}

		afterDelete() {
			this.onPostDeleted();
		}

		onPostDeleted() {
			const parent = this.getParentDiscussion();

			if (parent?.isDiscussion) {
				parent.onDiscussionDeleted(this.getPost());
			}
		}

		canAddDiscussion() {
			throw new Error('canAddDiscussion not implemented');
		}

		getDiscussionCount() {
			throw new Error('getDiscussionCount not implemented');
		}

		updateDiscussionCount() {
			throw new Error('updateDiscussionCount not implemented');
		}

		getDiscussions() {
			throw new Error('getDiscussions not implemented');
		}

		getDiscussionTree(sort) {
			return DiscussionTree.forDiscussion(this, sort);
		}

		addDiscussion() {
			throw new Error('addDiscussion not implemented');
		}

		onDiscussionAdded(discussion, silent) {
			this.updateDiscussionCount(this.getDiscussionCount() + 1);

			if (!silent) {
				this.emit(DiscussionAdded, discussion);
			}

			const parent = this.getParentDiscussion();

			if (parent?.isDiscussion) {
				parent.onDiscussionAdded(discussion, true);
			}
		}

		onDiscussionDeleted(discussion) {
			this.updateDiscussionCount(this.getDiscussionCount() - 1);
			this.emit(DiscussionDeleted, discussion);

			const parent = this.getParentDiscussion();

			if (parent?.isDiscussion) {
				parent.onDiscussionDeleted(discussion);
			}
		}

		subscribeToDiscussionAdded(fn) {
			this.addListener(DiscussionAdded, fn);

			return () => {
				this.removeListener(DiscussionAdded, fn);
			};
		}

		subscribeToDeleted(fn) {
			this.addListener(DiscussionDeleted, fn);

			return () => {
				this.removeListener(DiscussionDeleted, fn);
			};
		}

		subscribeToPostChange(fn) {
			const post = this.getPost();

			if (post === this) {
				return this.subscribeToChange(fn);
			}

			return post.subscribeToPostChange(fn);
		}
	};

mixin.getPayload = getPayload;
export default mixin;
