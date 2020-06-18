const DiscussionAdded = 'discussion-added';

export default function PostInterface (targetModelClass) {
	Object.assign(targetModelClass.Fields, {
		'body': targetModelClass.Fields.body ?? ({type: '*[]'}),
		'tags': targetModelClass.Fields.tags ?? ({type: 'string[]'}),
		'mentions': targetModelClass.Fields.mentions ?? ({type: 'string[]'}),
		'UserMentions': targetModelClass.Fields.mentions ?? ({type: 'model[]'})
	});

	return {
		isPost: true,

		getBody () {
			return this.body;
		},

		getDepth () {
			const parent = this.parent();

			return parent?.isPost ? (parent.getDepth() + 1) : 0;
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
			this.updateDiscussionCount(this.getDiscussionCount += 1);
			this.emit(DiscussionAdded, discussion);

			const parent = this.parent();

			if (parent.isPost) {
				parent.onDiscussionAdded(discussion);
			}
		},

		subscribeToDiscussionAdded (fn) {
			this.addListener(DiscussionAdded, fn);

			return () => {
				this.removeListener(DiscussionAdded, fn);
			};
		}
	};
}