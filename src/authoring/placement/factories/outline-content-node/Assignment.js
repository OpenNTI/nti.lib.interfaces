const AssignmentMimeType = 'application/vnd.nextthought.assessment.assignment';
const TimedAssignmentMimeType =
	'application/vnd.nextthought.assessment.timedassignment';
const DiscussionAssignmentType =
	'application/vnd.nextthought.assessment.discussionassignment';

export default {
	handles: [
		AssignmentMimeType,
		TimedAssignmentMimeType,
		DiscussionAssignmentType,
	],

	removeItemFrom(item, container) {
		return container.getContent().then(content => {
			return container.deleteLink('RemoveRefs', {
				target: item.NTIID,
			});
		});
	},
};
