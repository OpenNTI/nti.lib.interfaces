import {Service} from '../constants';

const DiscussionAdded = 'discussion-added';
const ResolvedMentions = Symbol('ResolvedMentions');
const ParentOverride = Symbol('Parent Override');

function getTitle (discussion) {
	const post = discussion.getPost();

	return post === discussion ? discussion.title : post.getTitle();
}

function getBody (discussion) {
	const post = discussion.getPost();

	return post === discussion ? discussion.body : post.getBody();
}

function getTags (discussion) {
	const post = discussion.getPost();

	return post === discussion ? discussion.tags : post.getTags();
}

function getMentions (discussion) {
	const post = discussion.getPost();

	if (post !== discussion) { return post.getMentions(); }

	return post[ResolvedMentions];
}

async function resolveMentions (discussion) {
	const post = discussion.getPost();

	if (post !== discussion) { return; }

	const mentions = post.UserMentions ?? [];

	const resolved = await Promise.all(
		mentions.map(async (mention) => {
			const User = await post[Service].getObject(mention.User);

			return {
				...mention,
				User
			};
		})
	);

	post[ResolvedMentions] = resolved;
}

function updatePost (discussion, ...args) {
	const post = discussion.getPost();

	if (post !== discussion) { return post.updatePost(...args); }

	return discussion.save(...args);
}


class DiscussionTree {
	static forDiscussion (discussion, sort, depth) {
		const tree = new DiscussionTree(discussion, sort, depth);

		return tree.load();
	}

	#node = null;
	#children = null;
	#depth = null;

	#sort = null;

	constructor (discussion, sort, depth = 0) {
		this.#node = discussion;
		this.#sort = sort;
		this.#depth = depth;
	}

	get node () { return this.#node; }
	get children () { return this.#children || []; }
	get depth () { return this.#depth; }

	async load () {
		let replies = await this.#node?.getDiscussions?.();

		if (!replies) { return; }

		if (this.#sort) {
			replies = replies.sort(this.#sort);
		}

		this.#children = await Promise.all(
			replies.map((reply) => DiscussionTree.forDiscussion(reply, this.#sort, this.depth + 1))
		);

		return this;
	}

	subscribeToUpdates (fn) {
		const update = () => fn(this);

		const cleanUps = [
			...this.children.map((child) => {
				return child.subscribeToUpdates(update);
			}),
			this.#node.subscribeToDiscussionAdded(async (newDiscussion) => {
				let newTree = new DiscussionTree(newDiscussion, this.#sort, this.depth + 1);
				let newReplies = [...this.children];

				newReplies.push(newDiscussion);

				if (this.#sort) {
					newReplies = newReplies.sort((a, b) => this.#sort(a.node, b.node));
				}

				this.#children = newReplies;

				update();
			})
		];

		return () => {
			for (let cleanup of cleanUps) {
				cleanup();
			}
		};
	}
}

export default function DiscussionInterface (targetModelClass) {
	Object.assign(targetModelClass.Fields, {
		'title': targetModelClass.Fields.title ?? ({type: 'string'}),
		'body': targetModelClass.Fields.body ?? ({type: '*[]'}),
		'tags': targetModelClass.Fields.tags ?? ({type: 'string[]'}),
		'mentions': targetModelClass.Fields.mentions ?? ({type: 'string[]'}),
		'UserMentions': targetModelClass.Fields.UserMentions ?? ({type: 'object[]'})
	});

	return {
		isDiscussion: true,
		getPost () { return this; },

		initMixin () {
			const resolve = resolveMentions(this);

			this.addToPending?.(resolve);
		},

		getTitle () { return getTitle(this); },

		getBody () { return getBody(this); },
		getTags () { return getTags(this); },
		getMentions () { return getMentions(this); },

		getMentionFor (username) {
			if (username.getID) {
				username = username.getID();
			}

			const mentions = this.getMentions();

			return (mentions || []).find(mention => mention.User.getID() === username);
		},

		updatePost (...args) {
			return updatePost(this, ...args);
		},
	
		getParentDiscussion () {
			if (this[ParentOverride]) { return this[ParentOverride]; }

			const parent = this.parent();

			return parent?.isDiscussion ? parent : null;
		},

		overrideParentDiscussion (parent) {
			this[ParentOverride] = parent;
		},

		canAddDiscussion () { throw new Error('canAddDiscussion not implementd'); },

		getDiscussionCount () {	throw new Error('getDiscussionCount not implemented'); },
		updateDiscussionCount () { throw new Error('updateDiscussionCount not implemented'); },

		getDiscussions () {	throw new Error('getDiscussions not implemented');	},

		getDiscussionTree (sort) {
			return DiscussionTree.forDiscussion(this, sort);
		},


		addDiscussion () { throw new Error('addDiscussion not implented'); },
		onDiscussionAdded (discussion) {
			this.updateDiscussionCount(this.getDiscussionCount() + 1);
			this.emit(DiscussionAdded, discussion);

			const parent = this.parent();

			if (parent.isDiscussion) {
				parent.onDiscussionAdded(discussion);
			}
		},

		subscribeToDiscussionAdded (fn) {
			this.addListener(DiscussionAdded, fn);

			return () => {
				this.removeListener(DiscussionAdded, fn);
			};
		},

		subscribeToPostChange (fn) {
			const post = this.getPost();

			if (post === this) { return this.subscribeToChange(fn); }

			return post.subscribeToPostChange(fn);
		}
	};
}