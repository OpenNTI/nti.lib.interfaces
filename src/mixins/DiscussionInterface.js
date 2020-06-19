import {Service} from '../constants';

const DiscussionAdded = 'discussion-added';
const ResolvedMentions = Symbol('ResolvedMentions');

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


export default function PostInterface (targetModelClass) {
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

		getDepth () {
			const parent = this.parent();

			return parent?.isDiscussion ? (parent.getDepth() + 1) : 0;
		},

		updatePost (...args) {
			return updatePost(this, ...args);
		},

		canAddDiscussion () { throw new Error('canAddDiscussion not implementd'); },

		getDiscussionCount () {	throw new Error('getCommountCount not implemented'); },
		updateDiscussionCount () { throw new Error('updateDiscussionCount not implemented'); },

		getDiscussions () {	throw new Error('getComments not implemented');	},
		async getFlatDiscussions (sort) {
			let discussions = await this.getDiscussions();
	
			if (sort) {
				discussions = discussions.sort(sort);
			}

			const expanded = await Promise.all(
				discussions.reduce((acc, discussion) => {
					if (!discussion.getFlatReplies) {
						return [...acc, discussion];
					}

					return [
						...acc,
						discussion,
						discussion.getFlatReplies()
					];
				}, [])
			);

			return expanded.reduce((acc, discussion) => {
				if (Array.isArray(discussion)) {
					return acc.concat(discussion);
				}

				return [...acc, discussion];
			}, []);
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