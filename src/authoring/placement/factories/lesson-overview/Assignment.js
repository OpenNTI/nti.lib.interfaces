const AssignmentMimeType = 'application/vnd.nextthought.assessment.assignment';
const TimedAssignmentMimeType = 'application/vnd.nextthought.assessment.timedassignment';

export default {
	handles: [AssignmentMimeType, TimedAssignmentMimeType],

	removeItemFrom (item, container) {
		return container.requestLink('RemoveRefs', 'delete', void 0, {target: item.NTIID});
	}
};
